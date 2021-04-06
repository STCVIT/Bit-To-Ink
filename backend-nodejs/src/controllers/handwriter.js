var fs = require('fs');
var formidable = require('formidable');
const axios = require('axios')
const PDFDocument = require('pdfkit');
const Jimp = require('jimp');
const mammoth = require('mammoth')


/**
 *  convertToHandwritten return the path for pdf file generated
 *  by accepting file to be parsed along with font type
 *  from a multipart form request
 */

const convertToHandwritten = async (req, res) => {

    var form = new formidable.IncomingForm();


    // parsing the form object 
    form.parse(req, async (err, fields, files) => {

        // console.log(files['file'])

        // Checking if file is uploaded and file size doesn't exceeds 25KB
        if (files['file'] && files['file'].type && files['file'].size <= 25000) {
            let fileContent = "";
            let error = ""

            // reading the file to be parsed
            fs.readFile(files['file'].path, async (err, data) => {
                let filePath = files['file'].path;
                let filebuffer = data;
                let filename = files['file'].name;

                if (filename.length == 0)
                    return "";
                var dot = filename.lastIndexOf(".");
                if (dot == -1)
                    return "";
                var fileextension = filename.substr(dot, filename.length);

                // console.log(filePath)
                // console.log(filebuffer)
                // console.log(filename)
                // console.log(fileextension)

                // Checking if file format is either .doc or .docx or .txt
                if (fileextension == '.docx') {

                    // reading .docx or .doc file using mammoth
                    try {
                        const docTxt = await mammoth.extractRawText({ path: filePath })

                        var textLines = docTxt.value.split("\n");

                        // deleting extra '\n' from text
                        for (var i = 0; i < textLines.length; i += 2) {
                            fileContent += textLines[i] + '\n'
                        }

                    } catch (e) {
                        error = e
                    }


                }
                else if (fileextension == '.txt') {

                    try {
                        fileContent = data.toString()

                    }
                    catch (e) {
                        error = e
                    }
                }
                else {
                    return res.status(415).send({ err: 'Invalid file format' })
                }

                if (error) {
                    return res.status(400).send(error)
                }

                //-------------here I have to check character limit

                console.log('file content : ' + fileContent)
                console.log('font selected : ' + fields.font)

                // sending request to python script for generating handwritten images
                axios.post('https://convert-to-handwriting.herokuapp.com/', {
                    "text": fileContent,
                    "font": parseInt(fields.font)
                })
                    .then(async (response) => {

                        const pages = ['1', '2', '3', '4']

                        imgArray = ['', '', '', '']

                        let imgCount = 0

                        // creating a pdf doc object 
                        var pdfDoc = new PDFDocument();

                        const createPdf = async () => {

                            // parsing the response and generating the imgCodes array with base64 codes
                            pages.forEach(element => {

                                if (data[element].length != 0) {
                                    for (let i = 0; i < response.data[element].length; i++) {
                                        if (i != 0 && i != 1 && i != (response.data[element].length - 1)) {
                                            imgArray[parseInt(element) - 1] += response.data[element][i]

                                        }
                                    }

                                }
                            })

                            // counting the number of images generated 
                            for (let i = 0; i < imgArray.length; i++) {

                                if (imgArray[i] != '') {
                                    imgCount += 1
                                }

                            }

                            // creating public directory in the root folder if doesn't exists
                            if (!fs.existsSync('./public')) {
                                fs.mkdirSync('./public');
                                console.log('directory created')
                            }

                            const timeStamp = Date.now()

                            // creating empty pdf file
                            const fileStream = fs.createWriteStream('./public/handwritten' + timeStamp + '.pdf')
                            pdfDoc.pipe(fileStream);

                            for (let i = 0; i < imgCount; i++) {

                                // generating png files from base64 codes
                                console.log('creating image')
                                fs.writeFileSync('./public/image' + timeStamp + (i + 1) + '.png', imgArray[i], { encoding: 'base64' });

                                if (i > 0) {
                                    pdfDoc.addPage()
                                }
                                console.log('adding image to pdf')

                                // adding generated images to pdf doc object
                                let image = await Jimp.read('./public/image' + timeStamp + (i + 1) + '.png');
                                image.getBuffer(Jimp.MIME_PNG, (err, result) => {

                                    // Scaling pdf proprotionally to the specified width
                                    pdfDoc.image(result, 34, 10, { width: 550 })
                                });

                                // deleted the images which are no longer in use
                                fs.unlink('./public/image' + timeStamp + (i + 1) + '.png', (err) => {
                                    if (err) {
                                        console.log('problem deleting image')
                                        return
                                    }
                                    else {
                                        console.log('image deleted')
                                    }

                                })
                            }


                            console.log('loading PDF')

                            pdfDoc.end();

                            // waiting for pdf to process and returning the pdf path
                            fileStream.on("close", () => {
                                console.log(`Generated PDF file `);

                                return res.send({ pdfFilename: 'handwritten' + timeStamp + '.pdf' })
                            })


                        }


                        await createPdf()


                    })
                    .catch(() => {
                        return res.status(500).send({ err: 'Script not working or request to script is invalid' })
                    })

            });

        }
        else {
            return res.status(400).send({ err: "No file uploaded or file size larger than 25Kb" })
        }

    })

}

module.exports = convertToHandwritten

