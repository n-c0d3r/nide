module.exports = (args)=>{
    return `
        nide.NewTab({
            'cursor': 0,
            'code': '',
            'fileName': nide.defaultFileName,
            'mode': nide.mode,
            'cwd': nide.cwd,
            'codeHis':[{
                'code':'',
                'cursor':0
            }],
            'hisCIndex':0
        });
    `;
}