import inquirer from "inquirer";
import fs from "fs";
import qrImage from "qr-image";
inquirer
.prompt([
    {
    message:"Enter the URL",
   name:"url",
}
])
.then((answers)=>{
    const url=answers.url;
const qr_svg=qrImage.image(url)
 qr_svg.pipe(fs.createWriteStream("qrimg.png"));
console.log("QR Code saved as 'qrimg.png'");
fs.writeFile("URL.txt",url,(err)=>{
if(err) throw err;
console.log("Created successfully");
});})
.catch((error) => {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment.");
    } else {
      console.log("Error:", error);
    }
  });