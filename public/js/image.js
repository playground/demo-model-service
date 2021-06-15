let ieam = {
  prevJson: '',
  loadJson: (file) => {
    fetch(file).then(async (res) => {
      ieam.prevJson = await res.json();
      console.log(ieam.prevJson)
    })
  },
  onSubmit: () => {
    console.log(ieam.prevJson)
    let $form = document.forms.namedItem('uploadForm');
    $form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      console.log(ieam.prevJson)
      let output = document.querySelector('div.output')
      const files = document.querySelector('[name=imageFile]').files;
      let formData = new FormData();
      formData.append('imageFile', files[0]);
      let xhr = new XMLHttpRequest();
      xhr.onload = function(oEvent) {
        if (xhr.status == 200) {
          output.innerHTML = "Uploaded!";
        } else {
          oOutput.innerHTML = "Error " + xhr.status + " occurred when trying to upload your file.<br \/>";
        }
      };

      xhr.open("POST", "/upload");
      xhr.send(formData);
    });
  },
  drawBBox: () => {
    const context = document.getElementById('canvas').getContext('2d');
    const canvas = document.getElementById('canvas');
    const timeDiv = document.getElementById('time');
    let tableDiv = document.getElementById('table');
    timeDiv.innerHTML = ieam.prevJson.elapsedTime;

    let table = document.createElement('table');
    let row = document.createElement('tr');
    let cell = document.createElement('th');
    let cellText = document.createTextNode('Label');
    cell.appendChild(cellText);
    row.appendChild(cell)
    cell = document.createElement('th');
    cellText = document.createTextNode('Confidence');
    cell.appendChild(cellText);
    row.appendChild(cell)
    cell = document.createElement('th');
    cellText = document.createTextNode('Min Pos');
    cell.appendChild(cellText);
    row.appendChild(cell)
    cell = document.createElement('th');
    cellText = document.createTextNode('Max Pos');
    cell.appendChild(cellText);
    row.appendChild(cell)
    table.appendChild(row);

    let img = new Image();
  //   img.addEventListener('load', () => {
  //     const { naturalWidth: width, naturalHeight: height } = img;
  //     console.log('loaded', width, height)
  //     canvas.width = width;
  //     canvas.height = height;
  //     canvas.width = width;
  //     canvas.height = height;
  //     context.drawImage(img, 0, 0, width, height);      
    
  //       row = document.createElement('tr');
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('person');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell)
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('0.756615400314331');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.16226908564567566,0.4117961525917053)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.966416597366333,0.652163565158844)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       table.appendChild(row);

  //       context.fillStyle = 'rgba(255,255,255,0.2)';
  //       context.strokeStyle = 'yellow';
  //       context.fillRect(0.4117961525917053 * width, 0.16226908564567566 * height, width * 0.240,
  //       height * 0.804);
  //       context.font = '15px Arial';
  //       context.fillStyle = 'white';
  //       context.fillText('person: 0.757', 0.4117961525917053 * width, 0.16226908564567566 * height, 0.16226908564567566 * height);
  //       context.lineWidth = 2;
  //       context.strokeRect(0.4117961525917053 * width, 0.16226908564567566 * height, width * 0.240, height * 0.804);      
      
  //       row = document.createElement('tr');
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('head');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell)
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('0.6803687810897827');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.19314710795879364,0.4342823922634125)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.6582494378089905,0.643329918384552)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       table.appendChild(row);

  //       context.fillStyle = 'rgba(255,255,255,0.2)';
  //       context.strokeStyle = 'yellow';
  //       context.fillRect(0.4342823922634125 * width, 0.19314710795879364 * height, width * 0.209,
  //       height * 0.465);
  //       context.font = '15px Arial';
  //       context.fillStyle = 'white';
  //       context.fillText('head: 0.680', 0.4342823922634125 * width, 0.19314710795879364 * height, 0.19314710795879364 * height);
  //       context.lineWidth = 2;
  //       context.strokeRect(0.4342823922634125 * width, 0.19314710795879364 * height, width * 0.209, height * 0.465);      
      
  //       row = document.createElement('tr');
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('hardhat');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell)
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('0.6148210763931274');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.19206060469150543,0.43538331985473633)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       cell = document.createElement('td');
  //       cellText = document.createTextNode('(0.6574199795722961,0.6440765857696533)');
  //       cell.appendChild(cellText);
  //       row.appendChild(cell);
  //       table.appendChild(row);

  //       context.fillStyle = 'rgba(255,255,255,0.2)';
  //       context.strokeStyle = 'yellow';
  //       context.fillRect(0.43538331985473633 * width, 0.19206060469150543 * height, width * 0.209,
  //       height * 0.465);
  //       context.font = '15px Arial';
  //       context.fillStyle = 'white';
  //       context.fillText('hardhat: 0.615', 0.43538331985473633 * width, 0.19206060469150543 * height, 0.19206060469150543 * height);
  //       context.lineWidth = 2;
  //       context.strokeRect(0.43538331985473633 * width, 0.19206060469150543 * height, width * 0.209, height * 0.465);      
      
  // tableDiv.appendChild(table);
   
  // });
  // img.src = 'my_picture.jpg';

  }
}