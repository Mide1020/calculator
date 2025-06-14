const display = document.getElementById('display');
const history = document.getElementById('history');
const toggleHistory = document.getElementById('toggleHistory');
let currentInput = '';
let historyLog = [];


function convertOperator(operators) {
  if (operators === '×') return '*';
  if (operators === '÷') return '/';
  if (operators === '^') return '**'; 
  return operators;
}

function updateDisplay() {
  display.value = currentInput;
}


function updateHistory() {
  history.innerHTML = historyLog.map(item => `<div>${item}</div>`).join('');
}

// Evaluate and show result
function calculateResult() {
  try {
    const expression = currentInput
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**'); // also support using ^ as power

    const result = eval(expression);
    historyLog.unshift(`${currentInput} = ${result}`);
    currentInput = result.toString();
    updateDisplay();
    updateHistory();
  } catch {
    display.value = 'Error';
    currentInput = '';
  }
}


function backspace() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}


function clearAll() {
  currentInput = '';
  historyLog = [];
  updateDisplay();
  updateHistory();
}


document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;

    if (!isNaN(value) || value === '.') {
      currentInput += value;
    } else if (['+', '-', '×', '÷', '%', '^'].includes(value)) {
      currentInput += convertOperator(value);
    } else if (value === '=') {
      calculateResult();
    } else if (value === '←' || value === '⌫') {
      backspace();
    } else if (value === 'C') {
      clearAll();
    }

    updateDisplay();
  });
});


document.addEventListener('keydown', (e) => {
  if (!isNaN(e.key) || ['+', '-', '*', '/', '.', '%'].includes(e.key)) {
    currentInput += e.key;
    updateDisplay();
  } else if (e.key === 'Enter') {
    calculateResult();
  } else if (e.key === 'Backspace') {
    backspace();
  } else if (e.key.toLowerCase() === 'c') {
    clearAll();
  } else if (e.key === '^') {
    currentInput += '**';
    updateDisplay();
  }
});


toggleHistory.addEventListener('click', () => {
  history.style.display = history.style.display === 'none' ? 'block' : 'none';
});
