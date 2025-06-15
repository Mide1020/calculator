const display = document.getElementById('display');
const historyPanel = document.getElementById('historyPanel');
const historyContent = document.getElementById('historyContent');
const toggleHistory = document.getElementById('toggleHistory');
const historyCount = document.getElementById('historyCount');
const clearHistory = document.getElementById('clearHistory');
const backtickButton = document.getElementById('backtickButton');
const buttonsContainer = document.getElementById('buttonsContainer');

let currentInput = '';
let historyLog = [];
let justCalculated = false;

// Conversion of display operators to JS operators
function convertOperator(operator) {
  const conversions = {
    '×': '*',
    '÷': '/',
    '^': '**'
  };
  return conversions[operator] || operator;
}

// Updating the display
function updateDisplay() {
  display.value = currentInput || '0';
}

// Updating the display history
function updateHistory() {
  historyCount.textContent = historyLog.length;
  
  if (historyLog.length === 0) {
    historyContent.innerHTML = '<div class="no-history">No calculations yet</div>';
  } else {
    historyContent.innerHTML = historyLog
      .map((item, index) => `
        <div class="history-item" data-index="${index}">
          <div class="history-expression">${item.expression}</div>
          <div class="history-result">= ${item.result}</div>
        </div>
      `)
      .join('');
    
    // Adding event listeners to history items
    document.querySelectorAll('.history-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        useHistoryResult(historyLog[index].result);
      });
    });
  }
}

// Use result from history function
function useHistoryResult(result) {
  currentInput = result;
  updateDisplay();
  justCalculated = true;
  showButtons();
}

// Show buttons interface function
function showButtons() {
  buttonsContainer.classList.remove('hidden');
  historyPanel.classList.remove('show');
}

// Showing history interface function
function showHistory() {
  buttonsContainer.classList.add('hidden');
  historyPanel.classList.add('show');
}

// Evaluating expression and result function
function calculateResult() {
  if (!currentInput || currentInput.trim() === '') {
    console.log('Empty input, nothing to calculate');
    return;
  }
  
  try {
    // Replace display operators with JavaScript operators
    let expression = currentInput
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**');
    
    // Remove any spaces
    expression = expression.replace(/\s/g, '');
    
    console.log('Expression to evaluate:', expression); // Debug log
    
    // More comprehensive validation
    // Allow numbers, operators, parentheses, and decimal points
    if (!/^[0-9+\-*/.()%\s*]+$/.test(expression)) {
      throw new Error('Invalid characters in expression');
    }
    
    // Prevent dangerous eval usage
    if (expression.includes('function') || expression.includes('eval') || 
        expression.includes('window') || expression.includes('document')) {
      throw new Error('Security violation');
    }
    
    // Check for expressions ending with operators (except closing parentheses)
    if (/[+\-*/.%]$/.test(expression)) {
      throw new Error('Expression ends with operator');
    }
    
    // Check for expressions starting with operators (except minus for negative numbers)
    if (/^[+*/.%]/.test(expression)) {
      throw new Error('Expression starts with invalid operator');
    }
    
    // Check for consecutive operators (improved) - handle ** properly
    let checkExpression = expression.replace(/\*\*/g, 'POW');
    if (/[+\-*/.%]{2,}/.test(checkExpression)) {
      throw new Error('Consecutive operators detected');
    }
    
    // Check for empty parentheses
    if (/\(\s*\)/.test(expression)) {
      throw new Error('Empty parentheses');
    }
    
    // Balance parentheses check
    let openParens = (expression.match(/\(/g) || []).length;
    let closeParens = (expression.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw new Error('Unbalanced parentheses');
    }
    
    let result;
    try {
      // Use Function constructor instead of eval for better security
      result = Function('"use strict"; return (' + expression + ')')();
      console.log('Calculation result:', result); // Debug log
    } catch (evalError) {
      console.log('Evaluation error:', evalError.message);
      throw new Error('Invalid mathematical expression');
    }
    
    // Check for invalid results
    if (typeof result !== 'number') {
      throw new Error('Result is not a number');
    }
    
    if (!isFinite(result)) {
      if (isNaN(result)) {
        throw new Error('Result is not a number (NaN)');
      } else {
        throw new Error('Result is infinite');
      }
    }
    
    // Round result to prevent floating point issues (increased precision)
    const roundedResult = Math.round(result * 1000000000) / 1000000000;
    
    // Adding to history
    historyLog.unshift({
      expression: currentInput,
      result: roundedResult.toString()
    });
    
    // Keep only last 20 calculations
    if (historyLog.length > 20) {
      historyLog = historyLog.slice(0, 20);
    }
    
    currentInput = roundedResult.toString();
    justCalculated = true;
    updateDisplay();
    updateHistory();
    
  } catch (error) {
    console.log('Calculator error:', error.message); // For debugging
    display.value = 'Error: ' + error.message; // Show specific error
    setTimeout(() => {
      currentInput = '';
      updateDisplay();
    }, 2500); // Increased timeout to read error
  }
}

// Handling backspace function
function backspace() {
  if (justCalculated) {
    // If we just calculated, clear everything on backspace
    currentInput = '';
    justCalculated = false;
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

// Clearing display function
function clearDisplay() {
  currentInput = '';
  justCalculated = false;
  updateDisplay();
}

// Clearing all history function
function clearAllHistory() {
  historyLog = [];
  updateHistory();
}

// Handling button input
function handleInput(value) {
  console.log('Input received:', value); // Debug log

  // If we just calculated and user enters a number, start fresh
  if (justCalculated && !isNaN(value)) {
    currentInput = '';
    justCalculated = false;
  } else if (justCalculated && ['+', '-', '×', '÷', '%', '^'].includes(value)) {
    // If we just calculated and user enters operator, continue with result
    justCalculated = false;
  } else if (justCalculated) {
    // For any other input after calculation, start fresh
    currentInput = '';
    justCalculated = false;
  }
  
  // Handling different input types
  if (!isNaN(value) || value === '.') {
    // Preventing multiple decimal points in the same number
    if (value === '.') {
      // Find the last operator position
      const lastOperatorIndex = Math.max(
        currentInput.lastIndexOf('+'),
        currentInput.lastIndexOf('-'),
        currentInput.lastIndexOf('×'),
        currentInput.lastIndexOf('÷'),
        currentInput.lastIndexOf('%'),
        currentInput.lastIndexOf('^'),
        currentInput.lastIndexOf('(')
      );
      const currentNumber = currentInput.substring(lastOperatorIndex + 1);
      if (currentNumber.includes('.')) {
        console.log('Decimal point already exists in current number');
        return; // Don't add another decimal point
      }
    }
    currentInput += value;
  } else if (['+', '-', '×', '÷', '%', '^'].includes(value)) {
    if (currentInput === '') {
      // Only allow minus at the start for negative numbers
      if (value === '-') {
        currentInput += value;
      }
      return;
    }
    
    // Preventing consecutive operators
    const lastChar = currentInput.slice(-1);
    if (['+', '-', '×', '÷', '%', '^'].includes(lastChar)) {
      // Replace the last operator with the new one
      currentInput = currentInput.slice(0, -1) + value;
    } else {
      currentInput += value;
    }
  } else if (value === '(' || value === ')') {
    currentInput += value;
  }
  
  updateDisplay();
}

// Button event listeners function
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const value = button.textContent;

    if (!isNaN(value) || value === '.') {
      handleInput(value);
    } else if (['+', '-', '×', '÷', '%', '^', '(', ')'].includes(value)) {
      handleInput(value);
    } else if (value === '=') {
      calculateResult();
    } else if (value === '⌫') {
      backspace();
    } else if (value === 'C') {
      clearDisplay();
    }
  });
});

// Keyboard event listener function
document.addEventListener('keydown', (e) => {
  // Don't prevent default for all keys, only calculator-related ones
  const calculatorKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','%','^','=','Enter','Backspace','c','C','Escape','.','(',')']; 
  
  if (!calculatorKeys.includes(e.key)) {
    return; // Let other keys work normally
  }
  
  e.preventDefault();
  
  if (!isNaN(e.key) || e.key === '.') {
    handleInput(e.key);
  } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
    const operatorMap = {
      '*': '×',
      '/': '÷'
    };
    handleInput(operatorMap[e.key] || e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    calculateResult();
  } else if (e.key === 'Backspace') {
    backspace();
  } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
    clearDisplay();
  } else if (e.key === '^') {
    handleInput('^');
  } else if (e.key === '(' || e.key === ')') {
    handleInput(e.key);
  }
});

// History toggle function
if (toggleHistory) {
  toggleHistory.addEventListener('click', () => {
    showHistory();
  });
}

// Back button function
if (backtickButton) {
  backtickButton.addEventListener('click', () => {
    showButtons();
  });
}

// Clearing history button function
if (clearHistory) {
  clearHistory.addEventListener('click', () => {
    clearAllHistory();
  });
}

// Initialize display
updateDisplay();
updateHistory();