let InitiateResponsiveInput = () => {
    // Create a div element
    const fakeEle = document.createElement('div');

    // Hide it completely
    fakeEle.id = "hid"
    fakeEle.style.position = 'absolute';
    fakeEle.style.top = '0';
    fakeEle.style.left = '-9999px';
    fakeEle.style.overflow = 'hidden';
    fakeEle.style.visibility = 'hidden';
    fakeEle.style.whiteSpace = 'nowrap';
    fakeEle.style.height = '0';

    // We copy some styles from the textbox that effect the width
    const textboxEle = document.getElementById('full_name');

    // Get the styles
    const styles = window.getComputedStyle(textboxEle);

    // Copy font styles from the textbox
    fakeEle.style.fontFamily = styles.fontFamily;
    fakeEle.style.fontSize = styles.fontSize;
    fakeEle.style.fontStyle = styles.fontStyle;
    fakeEle.style.fontWeight = styles.fontWeight;
    fakeEle.style.letterSpacing = styles.letterSpacing;
    fakeEle.style.textTransform = styles.textTransform;

    fakeEle.style.borderLeftWidth = styles.borderLeftWidth;
    fakeEle.style.borderRightWidth = styles.borderRightWidth;
    fakeEle.style.paddingLeft = styles.paddingLeft;
    fakeEle.style.paddingRight = styles.paddingRight;

    // Append the fake element to `body`
    document.body.appendChild(fakeEle);
}

let setWidth = function () {
    const textboxEle = document.getElementById('full_name');
    const fakeEle = document.getElementById('hid');

    const string = textboxEle.value || textboxEle.getAttribute('placeholder') || '';
    fakeEle.innerHTML = string.replace(/\s/g, '&' + 'nbsp;');

    const fakeEleStyles = window.getComputedStyle(fakeEle);
    textboxEle.style.width = fakeEleStyles.width;
};

// InitiateResponsiveInput();

// document.getElementById('full_name').addEventListener('input', function (e) {
//     setWidth();
// });

let register = () => {

}