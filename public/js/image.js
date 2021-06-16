let ieam = {
  prevJson: '',
  loadJson: (file) => {
    fetch(file).then(async (res) => {
      ieam.prevJson = await res.json();
      console.log(ieam.prevJson)
      ieam.drawBBox();
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
          ieam.loadJson('/static/js/image.json');
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
    let table = document.getElementById('table');
    timeDiv.innerHTML = ieam.prevJson.elapsedTime;

    let rowCount = table.rows.length;
    for(let i = 1; i < rowCount; i++) {
      table.deleteRow(1);
    }

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
    img.addEventListener('load', () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      console.log('loaded', width, height)
      canvas.width = width;
      canvas.height = height;
      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);      

      ieam.prevJson.bbox.forEach((box) => {
        let bbox = box.detectedBox;
        row = document.createElement('tr');
        cell = document.createElement('td');
        cellText = document.createTextNode(box.detectedClass);
        cell.appendChild(cellText);
        row.appendChild(cell)
        cell = document.createElement('td');
        cellText = document.createTextNode(box.detectedScore);
        cell.appendChild(cellText);
        row.appendChild(cell);
        cell = document.createElement('td');
        cellText = document.createTextNode(`(${bbox[0]},${bbox[1]})`);
        cell.appendChild(cellText);
        row.appendChild(cell);
        cell = document.createElement('td');
        cellText = document.createTextNode(`(${bbox[2]},${bbox[3]})`);
        cell.appendChild(cellText);
        row.appendChild(cell);
        table.appendChild(row);

        context.fillStyle = 'rgba(255,255,255,0.2)';
        context.strokeStyle = 'yellow';
        context.fillRect(bbox[1] * width, bbox[0] * height, width * (bbox[3] - bbox[1]),
        height * (bbox[2] - bbox[0]));
        context.font = '15px Arial';
        context.fillStyle = 'white';
        context.fillText(`'${box.detectedClass}: ${box.detectedScore}'`, `${box[1]} * width, ${box[0]} * height`, `${box[0]} * height`);
        context.lineWidth = 2;
        context.strokeRect(bbox[1] * width, bbox[0] * height, width * (bbox[3] - bbox[1]), height * (bbox[2] - bbox[0]));      
      })
    });
    img.src = '/static/input/image-old.png';
  }  
}