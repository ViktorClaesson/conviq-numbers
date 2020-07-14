const fetch = require("node-fetch");
const readline = require("readline");
const fs = require("fs");
const util = require("util");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rate(number) {
  return {
    number,
    last8: new Set(number.slice(2).split("")).size,
    last6: new Set(number.slice(4).split("")).size,
    noice: number.includes("69"),
    blaze: number.includes("420"),
  };
}

// 1594743690690
async function fetcher(runs) {
  for (let i = 0; i < runs; i++) {
    const idx = i + 1;
    console.log("FETCH", idx, "starting...");
    fetch(
      `https://webbutik.comviq.se/student/checkout/activationtype/availablePhoneNumbers/?_=${Date.now()}`,
      {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en,sv;q=0.9,en-US;q=0.8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie:
            "frontend=de778f33b97beebaea7b123f0ea34160; PAGECACHE_ENV=261e08f0e7950778328dd198aad77db0; EXTERNAL_NO_CACHE=1; user_allowed_set_cookie=1; CartItems=1",
        },
        referrer:
          "https://webbutik.comviq.se/student/checkout/comviqcart/processing/",
        referrerPolicy: "no-referrer-when-downgrade",
        body: null,
        method: "GET",
        mode: "cors",
      }
    )
      .then((blob) => blob.json())
      .then((json) => json.response)
      .then((arr) => numbers.push(...arr))
      .catch(() => {
        runs_dead++;
        console.log("FETCH", idx, "died.", `(${runs - runs_dead}`, "alive)");
      })
      .finally(() => {
        runs_done++;
        console.log("FETCH", idx, "done!", `(${runs - runs_done}`, "left)");
      });

    await sleep(500 + Math.floor(Math.random() * 600));
  }
}

function value(a) {
  const cool = a.blaze && a.noice;

  return (
    10000 * (cool ? 0 : 1) +
    1000 * a.last6 +
    100 * (a.noice ? 0 : 1) +
    10 * (a.blaze ? 0 : 1) +
    1 * a.last8 +
    0
  );
}

function compare(a, b) {
  return value(a) - value(b);
}

function poll(runs, startTime, pollingTime) {
  console.log("polling... (" + (Date.now() - startTime) / 1000 + " s)");

  if (numbers.length == (runs - runs_dead) * 5) {
    console.log("Done!");

    const original = numbers.map((nbr) => rate(nbr)).sort(compare);

    const logging = original.map((o) => ({
      n: o.number,
      l6: o.last6,
      l8: o.last8,
      BoN: (o.noice ? 1 : 0) + (o.blaze ? 1 : 0),
      s: value(o),
    }));

    console.log(logging);

    rl.question("Save? (yes/no): ", function (ans) {
      if (
        ans.trim().toLocaleLowerCase() === "yes" ||
        ans.trim().toLocaleLowerCase() === "y"
      ) {
        let data = original
          .map((o) => util.inspect(o, { breakLength: Infinity }))
          .join("\n");
        console.log("saving...");
        fs.mkdir("out", function () {});
        fs.writeFile(`out/${Date.now()}.txt`, data, function (err) {
          if (err) return console.log(err);
        });
      }
      rl.close();
    });
  } else {
    setTimeout(() => poll(runs, startTime, pollingTime), pollingTime);
  }
}

var runs_dead = 0;
var runs_done = 0;
var numbers = [];

rl.question("Runs (number): ", async function (runsString) {
  const runs = parseInt(runsString) ? parseInt(runsString) : 5;
  const startTime = Date.now();

  await fetcher(runs);
  poll(runs, startTime, 1000);
});
