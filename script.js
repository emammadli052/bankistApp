'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
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
    '2022-09-21T17:01:17.194Z',
    '2022-09-26T23:36:17.929Z',
    '2022-09-27T10:51:36.790Z',
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
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2];

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

// FUNCTIONS

const formatDate = (currDate, locale) => {
  const calcPassedDays = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const now = new Date();
  const days = calcPassedDays(now, currDate);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

  if (days === 0) return 'Today';
  else if (days === 1) return 'Yesterday';
  else if (days < 7) return `${days} days ago`;
  else if (days >= 7 && days < 14) return `a week ago`;
  else {
    // const day = currDate.getDate().toString().padStart(2, 0);
    // const month = (currDate.getMonth() + 1).toString().padStart(2, 0);
    // const year = currDate.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(currDate);
  }
};

// currency number formatter
const formatMovementDecimal = (num, acc) => {
  const options = {
    style: 'currency',
    currency: acc.currency,
  };
  return new Intl.NumberFormat(acc.locale, options).format(num);
};

const displayMovements = (acc, sort) => {
  containerMovements.innerHTML = '';
  const mov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  mov?.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatDate(date, acc.locale);

    const displayMovement = formatMovementDecimal(mov, acc);
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${displayMovement}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calclDisplaySummary = account => {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((interest, i, arr) => {
      return interest >= 1; // take interests greater than 1
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumIn.textContent = `${formatMovementDecimal(income, account)}`;
  labelSumOut.textContent = `${formatMovementDecimal(out, account)}`;
  labelSumInterest.textContent = `${formatMovementDecimal(interest, account)}`;
};

const createUserNames = accs => {
  accs.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUserNames(accounts);

const calcDisplayBalance = acc => {
  const balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  acc.balance = balance;
  labelBalance.textContent = `${formatMovementDecimal(balance, acc)}`;
};

const updateUI = acc => {
  // Display Movements
  displayMovements(acc);
  // Display Balance
  calcDisplayBalance(acc);
  // Display Summary
  calclDisplaySummary(acc);
};

// countdown function logic
let timer;
const startLogOutTimer = () => {
  let time = 300;
  const tick = () => {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time -= 1;
  };
  tick();
  timer = setInterval(tick, 1000);
  return timer;
};
//////////////////////////////////////////////////////////////////////////////////////
// Login EventHandler
let currentAccount;
btnLogin.addEventListener('click', e => {
  //Prevent Form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // optional chaining '?.'
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display Message
    labelWelcome.textContent = `Welcome, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    // Display UI
    containerApp.style.opacity = 100;
    // get current date and time
    const now = new Date();
    // const day = now.getDate().toString().padStart(2, 0);
    // const month = (now.getMonth() + 1).toString().padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = now.getHours().toString().padStart(2, 0);
    // const mins = now.getMinutes().toString().padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${mins}`;
    formatDate(now, currentAccount.locale);
    // timer countdown  function call
    clearInterval(timer);
    startLogOutTimer();
    // Remove keyboard focus
    inputLoginPin.blur();
    // update information
    updateUI(currentAccount);
  }
  // Reset inputs after submitting form
  inputLoginPin.value = '';
  inputLoginUsername.value = '';
});

// Transfer EventHandler
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  // find the account to whom the money is transferred
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const amount = +inputTransferAmount.value;
  // check if such account exist
  if (
    recieverAcc?.username &&
    amount > 0 &&
    amount <= currentAccount.balance &&
    currentAccount !== recieverAcc
  ) {
    // push new value to movement array
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());
    // update information
    updateUI(currentAccount);
    // timer countdown  function call
    clearInterval(timer);
    startLogOutTimer();
  }
  // Reset inputs after submitting form
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

// CloseAccount EventHandler
btnClose.addEventListener('click', e => {
  e.preventDefault();
  const index = accounts.findIndex(
    acc => acc.username === inputCloseUsername.value
  );
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

// ReuqestLoan EventHandler
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  const isLoanConfirmed = currentAccount.movements.some(
    mov => mov >= amount * 0.1
  );

  if (isLoanConfirmed && amount > 0) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    // timer countdown  function call
    clearInterval(timer);
    startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

// Sort Deposits EventHandler
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

//========================TESTING ENVIRONMENT==================================
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// const now = new Date();
// const locales = navigator.language;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
const euroToUsd = 1.1;

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/** Array Methods
 * slice
 * splice (c)
 * reverse (c)
 * concat
 * join
 * flat
 * flatMap
 * map
 * some
 * every
 * find
 * findIndex
 */

//=====================CHALLANGE #1=================================
// const julia = [3, 5, 2, 12, 7];
// const kate = [4, 1, 15, 8, 3];
// const checkDogs = (dogsJulia, dogsKate) => {
//   const dogsJuliaCorrected = dogsJulia;
//   dogsJuliaCorrected.splice(-2);
//   dogsJuliaCorrected.splice(0, 1);
//   //   console.log(dogsJulia);
//   const allDogs = [...dogsJuliaCorrected, ...dogsKate];
//   allDogs.forEach((dogAge, index) => {
//     const checkAdult = dogAge >= 3 ? 'adult' : 'puppy';
//     const result = `Dog number ${
//       index + 1
//     } is an ${checkAdult} and ${dogAge} years old`;

//     console.log(result);
//   });
// };
// checkDogs(julia, kate);

//=====================CHALLANGE #2=================================
// const calcAverageHumanAge = dogAges => {
//   const humanAges = dogAges.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
//   const humanAgesFiltered = humanAges.filter(age => age >= 18);
//   const humanAgesAverage =
//     humanAgesFiltered.reduce((acc, curr) => acc + curr) /
//     humanAgesFiltered.length;
//   console.log(humanAgesAverage.toFixed(2));
// };

// calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

//PIPELINE
// const totalDepositsUSD = movements
//   .filter(mov => mov < 0)
//   .map((mov, i, arr) => {
//     console.log(arr);
//     return mov * euroToUsd;
//   })
//   .reduce((acc, mov) => acc + mov, 0);

// labelBalance.addEventListener('click', () => {
//   // returns NodeList which does not support Array methods
//   const nodes = document.querySelectorAll('.movements__value');

//   // converts NodeList to array then we can use array methods on it
//   // Array.from(iterable, map_function)
//   const arr = Array.from(nodes, el => el.textContent.replace('€', ''));
//   console.log(`NodeList ${nodes}`);
//   console.log(`Array ${arr}`);
// });

// const arr = [[1, 2, 3], 5, 6];
// console.log(arr.flatMap(el => el));

// // Exercise 1
// const totalDeposit = accounts
//   .flatMap(acc => acc.movements)
//   .filter(el => el > 0)
//   .reduce((acc, curr) => acc + curr, 0);

// // Exercise 2
// const depositsOver1000 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, curr) => (curr >= 1000 ? ++count : count), 0);

// // Exercise 3
// const movObj = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, curr) => {
//       curr > 0 ? (sums.deposits += curr) : (sums.withdrawals += curr);
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// // Exercise 4
// // this is a nice title -> This Is a Nice Title
// const convertTitleCase = title => {
//   const exception = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and'];
//   console.log(
//     title
//       .toLowerCase()
//       .split(' ')
//       .map(word =>
//         !exception.includes(word) ? word[0].toUpperCase() + word.slice(1) : word
//       )
//       .join(' ')
//   );
// };
// convertTitleCase('this is a nice title');
// convertTitleCase('this is a LONG title but not too long');
// convertTitleCase('and here is another title with an EXAMPLE');

//=====================CHALLANGE #4=================================
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// // 1.
// dogs.forEach(dog => {
//   dog.recommendedFood = (dog.weight ** 0.75 * 28).toFixed(0);
// });

// // 2.
// const sarah = dogs.find(dog =>
//   dog.owners.join(' ').toLowerCase().includes('sarah')
// );
// console.log(sarah);

// const dogsEatingProportion = dog => {
//   if (
//     dog.curFood > 0.9 * dog.recommendedFood &&
//     dog.curFood < 1.1 * dog.recommendedFood
//   ) {
//     return 'NORMAL';
//   } else if (dog.curFood < dog.recommendedFood) {
//     return 'LESS';
//   } else {
//     return 'MORE';
//   }
// };

// // 3.
// const ownerEatTooMuch = dogs
//   .filter(dog => dogsEatingProportion(dog).toLowerCase() === 'more')
//   .flatMap(item => item.owners);
// const ownerEatTooLittle = dogs
//   .filter(dog => dogsEatingProportion(dog).toLowerCase() === 'less')
//   .flatMap(item => item.owners);
// console.log(ownerEatTooMuch);
// console.log(ownerEatTooLittle);

// // 4.
// console.log(`${ownerEatTooMuch.join(' and ')}'s dogs eat too much`);
// console.log(`${ownerEatTooLittle.join(' and ')}'s dogs eat too little`);

// // 5.
// console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// // 6.
// console.log(
//   dogs.some(dog => dogsEatingProportion(dog).toLowerCase() === 'normal')
// );

// // 7.
// const dogsOkayProportion = dogs.filter(
//   dog => dogsEatingProportion(dog).toLowerCase() === 'normal'
// );
// console.log(dogsOkayProportion);

// // 8.
// const shallowDogs = dogs.slice();
// shallowDogs.sort((a, b) => a.recommendedFood - b.recommendedFood);
// console.log(shallowDogs);

//**********************SECTION_12****************************/

//create date
// const now = new Date();
// console.log(now);
// console.log(new Date('Sep 28 2022 12:31:42'));
// console.log(new Date('Oct 21, 1995'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 9));

// console.log(now.getDate());
// console.log(now.getMonth());
// console.log(now.getDay());
// console.log(now.getFullYear());
// console.log(now.getHours());
// console.log(now.getMinutes());
// console.log(now.getSeconds());
// console.log(now.toISOString());
// console.log(now.getTime());
// console.log(new Date(now.getTime()));
// console.log(new Date(Date.now()));

// console.log(now.toLocaleDateString());
// console.log(`${now.getHours()}:${now.getMinutes()}`);

// const num = 388456125.23;
// const options = {
//   style: 'currency',
//   currency: 'USD',
// };
// console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('GB: ', new Intl.NumberFormat('en-GB', options).format(num));
// console.log('DE: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('SYRIA: ', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(new Intl.NumberFormat(navigator.language, options).format(num));
