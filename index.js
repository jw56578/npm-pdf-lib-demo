const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const { inherits } = require('util');
const moment = require('moment');

/**
 * THE ITEMS NEED TO BE AWARE OF THE FONT 
 * 
 */

const data = {
    template: 'certificate.pdf',
    pdfDoc:null,
    pdfBytes:null,
    writeToFileName: 'test.pdf',
    items: [{
        text: 'a short name',
        size: 50,
        font: 'CloisterBlack.ttf',
        centerOnX: 300, 
        y: 80,
        fontObject: null,
        fontBytes: null,
    },
    {
        text: 'a longer name to break down to multiple lines',
        size: 50,
        font: 'CloisterBlack.ttf',
        centerOnX: 300, 
        y: 80,
        fontObject: null,
        fontBytes: null,
    },
    ]
}

init();

async function init(){
    await loadFileBytes(data);
    await loadFontBytes(data);
    await initPdf(data);
    await embedFonts(data);
    await drawItems(data);

    const result = data;
}

async function loadFileBytes(data, done){
    return new Promise( (resolutionFunc,rejectionFunc) => {
        fs.readFile(data.template, function (err,bytes) {
            if (err) {
                rejectionFunc(err)
            }
            data.templateBytes = bytes;
            resolutionFunc();
        });
    })
}
async function loadFontBytes(data){
    return new Promise( (resolutionFunc,rejectionFunc) => {
        let i = 0;
        load(i);
        function load(itemIndex) {
            fs.readFile(data.items[i].font, function (err,bytes) {
                if (err) {
                    return console.log(err);
                }
                data.items[i].fontBytes = bytes;
                i ++;
                if(i < data.items.length)
                {
                    load(i);
                } else {
                    resolutionFunc();
                }
            });
        }
    });
}
async function initPdf(data) {
    try{
        data.pdfDoc = await PDFDocument.load(data.templateBytes)
        data.pdfDoc.registerFontkit(fontkit)
    }
    catch(e){
        console.log(e);
    }
}
async function embedFonts(data){
    for(let i =0; i < data.items.length; i ++){
        data.items[i].fontObject = await data.pdfDoc.embedFont( data.items[i].fontBytes);
    }

}
async function drawItems(data){

    const pages = data.pdfDoc.getPages()
    const page = pages[0]

    const { width, height } = page.getSize()
    data.items.forEach((item)=>{
        const textWidth = item.fontObject.widthOfTextAtSize(item.text, item.size);
        page.drawRectangle({
            x: 0,
            y: 270,
            width: width,
            height: 80,
            borderColor: rgb(1,1,1),
            color: rgb(1,1,1),
        })
        page.drawText(item.text, {
        x: width / 2 - textWidth / 2,
        y: 300,
        size: item.size,
        font: item.fontObject,
        color: rgb(0, 0, 0),
        })
        
    })
    const pdfBytes = await data.pdfDoc.save()
    
    fs.writeFile(data.writeToFileName, pdfBytes,()=>{

    });
}
