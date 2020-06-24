const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const { inherits } = require('util');

const studentNameSize = 50;


fs.readFile('certificate.pdf', function (err,certpdf) {
  if (err) {
    return console.log(err);
  }
  fs.readFile('CloisterBlack.ttf', function (err,fontData) {
    if (err) {
      return console.log(err);
    }
    createCertificate(certpdf, fontData, 'ralley expdkd dunkirkeryllllll');
  });
  
});

function calcStudentNameX(name, pageWidth){
    
    
}

async function createCertificate(existingPdfBytes, fontData, studentName, directorName, instructorName) {

    let pdfDoc = null;
    let font = null;
    try{
        pdfDoc = await PDFDocument.load(existingPdfBytes)
        font = fontkit.create(fontData);
        pdfDoc.registerFontkit(fontkit)
    }
    catch(e){
        console.log(e);
    }
   
    // Embed the Helvetica font
    font = await pdfDoc.embedFont(fontData)
    
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    
    const { width, height } = firstPage.getSize()
    
    firstPage.drawRectangle({
        x: 0,
        y: 270,
        width: width,
        height: 80,
        borderColor: rgb(1,1,1),
        color: rgb(1,1,1),
    })

    const textWidth = font.widthOfTextAtSize(studentName, studentNameSize);

    firstPage.drawText(studentName, {
    x: width / 2 - textWidth / 2,
    y: 300,
    size: studentNameSize,
    font: font,
    color: rgb(0, 0, 0),
    })
    

    const pdfBytes = await pdfDoc.save()
    
    fs.writeFile('modifiedcertificate.pdf', pdfBytes,()=>{

    });
}