const express = require('express')
const path = require('path')
const md5 = require('md5')
const multer = rquire('multer')

const router = require('express').Router();
const randomstring = require('randomstring')
const fs = require('fs')

router.post('/attaches', async(req, res) => {
    // 업로드 허용 확장자
    const allowExt = [".csv", ".psd", ".pdf", ".ai", ".eps", ".ps", ".smi", ".xls", ".ppt", ".pptx",".gz", ".gzip", ".tar", ".tgz", ".zip", ".rar", ".bmp", ".gif", ".jpg", ".jpe",".jpeg", ".png", ".tiff", ".tif", ".txt", ".text", ".rtl", ".xml", ".xsl",".docx", ".doc", ".dot", ".dotx", ".xlsx", ".word", ".srt",".webp"];
    // 이미지 파일 확장자
    const imageExt = [".gif",".jpg",".jpe",".jpeg",".png",".tiff",".tif",".webp"];

    const yearMonth = path.posix.join((new Date().getFullYear()).toString(), (new Date().getMonth() + 1).toString());
    const directory = path.join('data', 'uploads', yearMonth);
    const uploadPath = path.join(root, 'data', 'uploads', yearMonth);

    const upload = multer({
        dest: uploadPath,
    }).array('userfile');

    try {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, {recursive: true});
        }
    } catch (err) {
        console.error('디렉토리 생성 중 에러 발생:', err);
        return res.status(500).json({error: 'Failed to create directory'});
    }


})