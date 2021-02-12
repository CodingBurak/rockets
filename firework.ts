
namespace firework {

  export let crc2: CanvasRenderingContext2D;
  export let canvas: HTMLCanvasElement;
  let rockets: Rocket[] = [];
  let allRockets: RocketObject[] = [];
  export let allScatters: Scatter[] = [];
  let selectedRocket: Rocket;
  let mouseVector: Vector = { x: 400, y: 300 };
  const MAX_PARTICLES: number = 4000;

  let addButton: HTMLButtonElement;
  let testButton: HTMLButtonElement;
  let rocketName: HTMLInputElement;
  let colorSlider: HTMLInputElement;
  let secondColorSlider: HTMLInputElement;
  let sizeSlider: HTMLInputElement;
  let speedSlider: HTMLInputElement;
  let colorOutput: HTMLSpanElement;
  let secondColorOutput: HTMLSpanElement;
  let sizeOutput: HTMLSpanElement;
  let speedOutput: HTMLSpanElement;

  let client: Client;

  window.addEventListener("load", onPageLoad);


  function onPageLoad() {
    client = new Client();
    colorSlider = document.getElementById("colorSlider") as HTMLInputElement;
    secondColorSlider = document.getElementById("secondColorSlider") as HTMLInputElement;
    rocketName = document.getElementById("rocketName") as HTMLInputElement;
    speedSlider = document.getElementById("speedSlider") as HTMLInputElement;
    sizeSlider = document.getElementById("sizeSlider") as HTMLInputElement;

    colorOutput = document.getElementById("colorOutput");
    colorOutput.innerHTML = colorSlider.value;

    secondColorOutput = document.getElementById("secondColorOutput");
    secondColorOutput.innerHTML = secondColorSlider.value;

    sizeOutput = document.getElementById("sizeOutput");
    sizeOutput.innerHTML = sizeSlider.value;

    speedOutput = document.getElementById("speedOutput");
    speedOutput.innerHTML = sizeSlider.value;



    colorSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      colorOutput.innerHTML = target.value;
    }

    secondColorSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      secondColorOutput.innerHTML = target.value;
    }

    speedSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      speedOutput.innerHTML = target.value;
    }

    sizeSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      sizeOutput.innerHTML = target.value;
    }

    addButton = document.getElementById("addRocket") as HTMLButtonElement;
    testButton = document.getElementById("testRocket") as HTMLButtonElement;
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas)
      return;

    canvas.addEventListener("mousedown", launchRockets);
    addButton.addEventListener("click", postRocket);
    testButton.addEventListener("click", testRocket);

    crc2 = <CanvasRenderingContext2D>canvas.getContext("2d")
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setBackground();
    getAllRockets();
    setInterval(gameLoop, 16);

  }

  function launchRockets(event: MouseEvent): void {

    for (let i = 0; i < allRockets.length; i++) {
      launchFrom(Math.random() * canvas.width * 2 / 3 + canvas.width / 6, allRockets[i]);
    }
  }

  function testRocket(): void {
    let testRocket: RocketObject = {
      name: rocketName.value,
      color: Number.parseInt(colorSlider.value),
      secondColor: Number.parseInt(secondColorSlider.value),
      size: Number.parseFloat(sizeSlider.value),
      speed: Number.parseInt(speedSlider.value)
    }
    launchFrom(300, testRocket);
  }

  function launchFrom(posX: number, rocketObj: RocketObject): void {

    //if (allRockets.length < 5) {
    let pos: Vector = { x: posX, y: canvas.height };
    let rocket = new Rocket(pos, rocketObj);

    rocket.vel.y = Math.random() * -3 - 4;
    rocket.vel.x = Math.random() * 6 - 3;

    rockets.push(rocket);
    //}
  }

  function gameLoop(): void {

    setBackground();
    let queueRockets: Rocket[] = [];
    for (var i = 0; i < rockets.length; i++) {
      // update and render
      rockets[i].animate();

      //explode in the upper 80% of screen
      if (rockets[i].pos.y < canvas.height * 0.2) {
        allScatters.push(...rockets[i].createScatter());
      } else {
        queueRockets.push(rockets[i]);
      }
    }
    rockets = queueRockets;
    for (var i = 0; i < allScatters.length; i++) {
      allScatters[i].animate();
      // render and save particles that can be rendered
      ;
    }
  }

  async function getAllRockets() {
    allRockets = await client.getAllRockets()
  }


  async function postRocket(): Promise<RocketObject> {
    let testRocket: RocketObject = {
      name: rocketName.value,
      color: Number.parseInt(colorSlider.value),
      secondColor: Number.parseInt(secondColorSlider.value),
      size: Number.parseFloat(sizeSlider.value),
      speed: Number.parseInt(speedSlider.value)
    }
    let posted: RocketObject = await client.postRocket(testRocket)
    allRockets = await client.getAllRockets();
    console.log(posted)
    return posted;
  }

  function setBackground(): void {

    crc2.save();
    crc2.fillStyle = "rgba(0, 0, 0, 0.15)";
    crc2.fillRect(0, 0, canvas.width, canvas.height);
    var text = "Welcome!";
    crc2.textAlign = "center"
    crc2.fillStyle = "red";
    crc2.font = "30px Comic Sans MS";
    crc2.fillText(text, canvas.width / 2, canvas.height / 4);


  }




}