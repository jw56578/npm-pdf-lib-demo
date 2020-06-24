const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const { inherits } = require('util');
const moment = require('moment');

const studentNameSize = 50;
const signatureSize = 30;


fs.readFile('certificate.pdf', function (err,certpdf) {
  if (err) {
    return console.log(err);
  }
  certLoaded({
      certBytes:certpdf
  });
  
});

function certLoaded(data){
    fs.readFile('CloisterBlack.ttf', function (err,studentNameFontBytes) {
        if (err) {
          return console.log(err);
        }
        studentNameFontLoaded({
            ... data,
            studentNameFontBytes,
        });
    });
}
function studentNameFontLoaded(data){
    fs.readFile('signature1.ttf', function (err,signature1FontBytes) {
        if (err) {
          return console.log(err);
        }
        signatureOneFontLoaded({
            ... data,
            signature1FontBytes,
        });
    });
}

function signatureOneFontLoaded(data){
    fs.readFile('signature2.ttf', function (err,signature2FontBytes) {
        if (err) {
          return console.log(err);
        }
        signatureTwoFontLoaded({
            ... data,
            signature2FontBytes,
        });
    });
}

function signatureTwoFontLoaded(data){
    createCertificate({
        ... data,
        studentName: 'Bobby Smith',
        instructorName: 'ted mosbey',
        directorName: 'Barney stinson'});
}

async function createCertificate(data) {
    const {studentNameFontBytes,signature1FontBytes, 
        signature2FontBytes, certBytes, 
        studentName, directorName, instructorName} = data;
    let pdfDoc = null;
    let font = null;
    let signatureOneFont =null;
    let signatureTwoFont = null;
    try{
        pdfDoc = await PDFDocument.load(certBytes)
        signatureOneFont = fontkit.create(signature1FontBytes);
        signatureTwoFont = fontkit.create(signature2FontBytes);
        font = fontkit.create(studentNameFontBytes);

        pdfDoc.registerFontkit(fontkit)
    }
    catch(e){
        console.log(e);
    }
   
    font = await pdfDoc.embedFont(studentNameFontBytes);
    signatureOneFont = await pdfDoc.embedFont(signature1FontBytes);
    signatureTwoFont = await pdfDoc.embedFont(signature2FontBytes);
    
    const pages = pdfDoc.getPages()
    const page = pages[0]
    
    drawStudentName(page, font, studentName);
    drawDate(page);
    drawInstructorName(page, signatureOneFont, instructorName);
    drawDirectorName(page, signatureTwoFont, directorName);

    const pdfBytes = await pdfDoc.save()
    
    fs.writeFile('modifiedcertificate.pdf', pdfBytes,()=>{

    });
}
function drawStudentName(page, font,  studentName){
    const { width, height } = page.getSize()
    
    page.drawRectangle({
        x: 0,
        y: 270,
        width: width,
        height: 80,
        borderColor: rgb(1,1,1),
        color: rgb(1,1,1),
    })

    const textWidth = font.widthOfTextAtSize(studentName, studentNameSize);

    page.drawText(studentName, {
    x: width / 2 - textWidth / 2,
    y: 300,
    size: studentNameSize,
    font: font,
    color: rgb(0, 0, 0),
    })
    
}
function drawDate(page, font){
    // find location of the data

    const x = 380;
    const y = 159;

    const { width, height } = page.getSize()
    page.drawRectangle({
        x,
        y: y - 10,
        width: 200,
        height: 30,
        borderColor: rgb(1,1,1),
        color: rgb(1,1,1),
    })


    page.drawText(moment(new Date).format('Do of MMMM, YYYY'), {
    x,
    y,
    size: 18,
    font: font,
    color: rgb(0, 0, 0),
    })
}
function drawDirectorName(page, font, name){
    // 200 is center of signature
    const textWidth = font.widthOfTextAtSize(name, signatureSize);

    page.drawText(name, {
    x: 200 - textWidth / 2,
    y: 80,
    size: signatureSize,
    font: font,
    color: rgb(0, 0, 0),
    })
}
function drawInstructorName(page, font, name){
    //575 is center of signature
    const textWidth = font.widthOfTextAtSize(name, signatureSize);

    page.drawText(name, {
    x: 575 - textWidth / 2,
    y: 80,
    size: signatureSize,
    font: font,
    color: rgb(0, 0, 0),
    })
}