
function ncodeKeyIndexHandler(ncodeKeyIndex){
    let result = [];
    for (var i=0;i<ncodeKeyIndex.length;i++){
        let temp = [ncodeKeyIndex[i][0],[]];
        for (var j=0;j<ncodeKeyIndex[i][1].length;j++) {
            let end = ncodeKeyIndex[i][1][j][0] + ncodeKeyIndex[i][1][j][1];
            for (var k = ncodeKeyIndex[i][1][j][0]; k < end ;k++)
                temp[1].push(k);
        }
        result.push(temp)
    }
    window.console.log("ncodeKeyIndexHandler:",result)
    return result;
}

function genBlankArray(newncode,ncode){
    var blankArray =[];
    for(var i=0;i< ncode.length;i++)
    {
        var num =newncode[i].indexOf(ncode[i]);
        var blank ="";
        for (var j=0;j<num;j++)
            blank+=" "+"\u00A0"
        blankArray.push(blank)
    }
    window.console.log(blankArray)
    return blankArray;
}

export  {
    ncodeKeyIndexHandler,
    genBlankArray
}