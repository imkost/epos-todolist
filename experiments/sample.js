const props = {
  title: 'Hello world',
  valueAbc: 10,
}


function title (props) {
  return `
    <div class="title">
      <img src="${props.title}" alt="" class="sample"> 
      ${props.valueAbc}
    </div>
  `
}
