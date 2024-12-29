import data from '../data/data.json';

export function generateIconCSS() {
  const style = document.createElement('style');
  
  const css = data.icons.map(icon => {
    // Convert position string "-64px -128px" to percentages based on sprite sheet size
    const [x, y] = icon.position.split(' ').map(pos => parseInt(pos));
    const xPercent = (Math.abs(x) / 832) * 100; // 832 = 13 columns * 64px
    const yPercent = (Math.abs(y) / 896) * 100; // 896 = 14 rows * 64px
    
    return `.item-icon-${icon.id} { background-position: ${xPercent}% ${yPercent}%; }`;
  }).join('\n');
  
  style.textContent = `
    .item-icon {
      background-image: url("/icons.webp");
      background-size: 1400%;  /* 14 columns */
      background-repeat: no-repeat;
      background-color: #3a3a3a;
      border: 1px solid #4a4a4a;
      border-radius: 4px;
    }
    ${css}
  `;
  
  document.head.appendChild(style);
}
