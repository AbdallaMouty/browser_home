class LiveClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
        <style>
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0;
          }
          .clock {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 0.25rem;
            padding: 0;
            height: fit-content;
          }
          .hours { color: #f4f4f4; font-weight: 300; font-size: 6rem; }
          .minutes { color: #f4f4f4; font-weight: 300; font-size: 6rem; }
          .seconds { color: #f4f4f450; font-weight: 300; font-size: 3rem; padding-bottom: 1.2rem; }
          .sep { color: #f4f4f450; font-weight: 400; font-size: 6rem; }
          .greeting { color: #f4f4f490; font-weight: 300; font-size: 1.3rem; margin: 0 }
        </style>
        <div class="container">
          <div class="clock">
            <span class="hours">00</span>
            <span class="sep">:</span>
            <span class="minutes">00</span>
            <span class="seconds">00</span>
          </div>
          <span class="greeting">Good day</span>
        </div>
      `;

    this.hoursEl = this.shadowRoot.querySelector(".hours");
    this.minutesEl = this.shadowRoot.querySelector(".minutes");
    this.secondsEl = this.shadowRoot.querySelector(".seconds");
    this.greetingEl = this.shadowRoot.querySelector(".greeting");
  }

  connectedCallback() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }

  updateTime() {
    // Set the timezone you want
    const timeZone = "Asia/Baghdad";

    const now = new Date();

    // Get the time in the target timezone
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    };
    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);

    const hours = parts.find((p) => p.type === "hour").value;
    const minutes = parts.find((p) => p.type === "minute").value;
    const seconds = parts.find((p) => p.type === "second").value;

    this.hoursEl.textContent = hours;
    this.minutesEl.textContent = minutes;
    this.secondsEl.textContent = seconds;

    // Use the hour for greeting
    const hourNumber = parseInt(hours, 10);
    this.updateGreeting(hourNumber);
  }

  updateGreeting(hour) {
    let greeting = "Hello";
    if (hour >= 5 && hour < 12) {
      greeting = "Good morning 🌅";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Good afternoon 🌞";
    } else if (hour >= 18 && hour < 22) {
      greeting = "Good evening 🌙";
    } else {
      greeting = "Good night 🌌";
    }
    this.greetingEl.textContent = greeting;
  }
}

customElements.define("live-clock", LiveClock);
