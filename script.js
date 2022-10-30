'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-05-28T23:36:17.929Z',
    '2022-05-30T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2022-05-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// FORMATTING MOVEMENTS
const formatMovements = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  // console.log(daysPassed);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed > 1 && daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};
// formatting intl numbers:
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
// DISPLAYING MOVEMENTS IN CONTAINER
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovements(date, acc.locale);
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// DISPLAY BALANCE
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// DISPLAY SUMMARY
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

// CREATE USERNAMES
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// UPDATE THE UI
const updateUI = function (acc) {
  if(timer) clearInterval(timer);
  timer = startLogoutTimer();
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;
let timer;
// const currentDate = new Date();
// const locale= navigator.language;
// const options = {
//   hour:'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric',
//   weekday: 'short'
// }
// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

///////////////////////////////////////////////////////////
// Fake Login for testing:
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
//////////////////////////////////////////////////////////
// LOGOUT TIMER
const startLogoutTimer = function(){
  //set time to 5 minutes
  let time = 300;
  const tick = function(){
    const min = `${Math.trunc(time/60)}`.padStart(2,0);
    const sec = `${(time%60)}`.padStart(2,0);
    labelTimer.textContent= `${min}:${sec}`;
    time--;
    if(time === 0){
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to start'
    }
  }
  //call timer each second
  tick();
  const timer = setInterval(tick , 1000);
  return timer;
  //in each call print remaining time to UI

  //when at zero, logout user
}

// LOG IN BUTTON HANDLER
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Working with current date:
    const currentDate = new Date();
    const locale = navigator.language;
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'short'
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(currentDate);
    //day/month/year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    
    

    // Update UI
    updateUI(currentAccount);
    
  }
});

// TRANSFER BUTTON HANDLER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

// LOAN BUTTON HANDLER
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(()=>{
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    }, 5000)
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// SORT BUTTON HANDLER
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);

// Base 10 ~ 0-9
// Binary Base 2 ~ 0 1

console.log(0.1 + 0.2); //not 0.3
console.log(0.1 + 0.2 === 0.3); //false

//Converting strings to numbers
console.log(Number('12'));
console.log(+ '23'); //converts string to number
console.log(1 +(+'23'));

//Parsing numbers
console.log(Number.parseInt('30px', 10));
//String must START with a number, only takes the number off the front
console.log(Number.parseFloat('2.5rem'));

console.log(Number.isNaN(20)); //false
console.log(Number.isNaN('20')); //false
console.log(Number.isNaN(+'20X')); //true
console.log(Number.isNaN('number')); //false
console.log(Number.isNaN('Jerry')); //false


//best at checking if number not string
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite('One'));
console.log(Number.isFinite(23/0));

//check if it IS a number
console.log(Number.isInteger('one'));
console.log(Number.isInteger(22));

console.log(Math.sqrt(25));
console.log(25 ** (1/3));

console.log(Math.max(5,6,7,8,9,34));
console.log(Math.max(5,6,7,'8px',9,34));
console.log(Math.max(5,6,7,'8',9,34));
console.log(Math.min(5,6,7,'8',9,34));

console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.trunc(Math.random() * 100) +1);

const randomInt = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;
console.log(randomInt(9,30));

// Rounding integers
console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));

console.log(Math.round(23.3));
console.log(Math.round(23.9));
console.log(Math.floor(23.9));

console.log(Math.floor(-23.9));
console.log(Math.trunc(-23.9));


//Rounding Decimals

console.log((2.7).toFixed(0));
console.log(+(2.345).toFixed(2));

console.log(5 % 2);
console.log(6 % 2);

const isEven = n => n % 2 === 0;
console.log(isEven(2));
console.log(isEven(9));

const isDivisible = (num, div) => num % div === 0;
console.log(isDivisible(10, 5));
console.log(isDivisible(17, 3));

labelBalance.addEventListener('click', function(){[...document.querySelectorAll('.movements__row')].forEach(function(row, i){
  if(i % 2 === 0) row.style.backgroundColor = 'gray';
  if(i%3 === 0)row.style.backgroundColor = 'blue';
})})

// Numeric Separators
const diameter = 287_460_000_000;
console.log(diameter);

const priceCents= 345_99
console.log(priceCents);

const transferFee = 15_00;

const PI = 3.1415;
console.log(2 ** 53 -1);
console.log(Number.MAX_SAFE_INTEGER + 1 +1);

console.log(98734918758739831798743897398715987587387);
console.log(98734918758739831798743897398715987587387n + 1n);
console.log(BigInt(987349187587));

//Operations
console.log(10000n + 10000n);
console.log(1000065498465165496846513521n * 100009847984165165849849841654198n);


//Create a Date
const day = new Date(); //current date and time
console.log(day);

console.log(new Date('May 31 2022 11:28:00'));
console.log(new Date('December 24, 2022'));

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142285780000));

console.log(Date.now());
console.log(new Date(1654022494115));

future.setFullYear(2040);
console.log(future);

const today = new Date();
const future = new Date(2022, 10, 19, 15, 23);
console.log(Number(future)); //convert date to number


const daysPassed = (date1, date2) => Math.abs(date2 - date1)

console.log(daysPassed(future, today)/(1000 *60*60*24));


const num = 3884764.23;

const options={
  style: "currency",
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: true
}
console.log('Pt:    ' ,new Intl.NumberFormat('pt-PT', options).format(num));
console.log('Syria:    ' ,new Intl.NumberFormat('ar-SY', options).format(num));
console.log('Germany:    ' ,new Intl.NumberFormat('de-DE', options).format(num));
console.log('Locale:    ' ,new Intl.NumberFormat(navigator.language, options).format(num));

//Set Timeout
setTimeout(()=> console.log('Here is your pizza'), 3000);

//setInterval
setInterval(function(){
  const now = new Date();
  console.log(now);
}, 1000)
*/