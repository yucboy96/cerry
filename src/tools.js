
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
    return blankArray;
}
function getCodeChip() {
    let codes = "[\"protected void unregisterlistener ( ) {\\n metadataprovider mdp = attributetype . getmetadataprovider ( ) ;\\n if ( mdp != null ) {\\n mdp . removemetadatachangelistener ( this ) ;\\n }\\n }\", \"public static genericpk create ( genericpk value ) {\\n genericpk newpk = new genericpk ( ) ;\\n newpk . init ( value ) ;\\n return newpk ;\\n }\", \"private void writeattribute ( java . lang . string prefix , java . lang . string namespace , java . lang . string attname , java . lang . string attvalue , javax . xml . stream . xmlstreamwriter xmlwriter ) throws javax . xml . stream . xmlstreamexception {\\n if ( xmlwriter . getprefix ( namespace ) == null ) {\\n xmlwriter . writenamespace ( prefix , namespace ) ;\\n xmlwriter . setprefix ( prefix , namespace ) ;\\n }\\n xmlwriter . writeattribute ( namespace , attname , attvalue ) ;\\n }\", \"public void savemovie ( int type ) throws moviesaveexception {\\n currentframe = num_ ;\\n string desc = null ;\\n if ( type == movieinfoprovider . type_quicktime_jpeg ) {\\n createmovformat ( ) ;\\n desc = filetypedescriptor . quicktime ;\\n }\\n else if ( type == movieinfoprovider . type_avi_mjpeg ) {\\n createmjpegformat ( ) ;\\n desc = filetypedescriptor . msvideo ;\\n }\\n else if ( type == movieinfoprovider . type_avi_raw ) {\\n creatergbformat ( ) ;\\n desc = filetypedescriptor . msvideo ;\\n }\\n else throw new unsupportedoperationexception ( str_ ) ;\\n try {\\n itm . savemovie ( mip . getmedialocator ( ) , desc , videoformat ) ;\\n }\\n catch ( exception e ) {\\n throw new moviesaveexception ( e ) ;\\n }\\n }\", \"public shoppingcartitem findcartitem ( string productid , map < string , genericvalue > features , map < string , object > attributes , string prodcatalogid , bigdecimal selectedamount ) {\\n for ( int i = num_ ;\\n i < this . cartlines . size ( ) ;\\n i ++ ) {\\n shoppingcartitem cartitem = cartlines . get ( i ) ;\\n if ( cartitem . equals ( productid , features , attributes , prodcatalogid , selectedamount ) ) {\\n return cartitem ;\\n }\\n }\\n return null ;\\n }\", \"public builder addshard ( indexshardroutingtable refdata , shardrouting shard ) {\\n indexshardroutingtable indexshard = shards . get ( shard . id ( ) ) ;\\n if ( indexshard == null ) {\\n indexshard = new indexshardroutingtable . builder ( refdata . shardid ( ) ) . addshard ( new shardrouting ( shard ) ) . build ( ) ;\\n }\\n else {\\n indexshard = new indexshardroutingtable . builder ( indexshard ) . addshard ( new shardrouting ( shard ) ) . build ( ) ;\\n }\\n shards . put ( indexshard . shardid ( ) . id ( ) , indexshard ) ;\\n return this ;\\n }\", \"public clock logtime ( string message ) {\\n super . split ( ) ;\\n string time = durationformatutils . formatdurationhms ( super . getsplittime ( ) ) ;\\n string msg = message + separator + time ;\\n if ( log != null ) {\\n log . info ( msg ) ;\\n }\\n else {\\n defaultlog . info ( msg ) ;\\n }\\n return this ;\\n }\", \"public void testcrlocationandtimevaluebutnolocation ( ) throws exception {\\n try {\\n new testhelper ( str_ , str_ , str_ , str_ ) . runtest ( ) ;\\n }\\n catch ( exception e ) {\\n asserttrue ( e . tostring ( ) . contains ( geospatialsearchexception . class . getname ( ) ) ) ;\\n return ;\\n }\\n throw new runtimeexception ( str_ ) ;\\n }\", \"private string processfunction ( string value , variables variables ) {\\n string returnvalue = value ;\\n if ( functionhandler . validfunction ( returnvalue ) ) {\\n returnvalue = functionhandler . executefunction ( returnvalue , variables ) ;\\n }\\n return returnvalue != null ? returnvalue : str_ ;\\n }\", \"public static < a , b , c > t3 < list < a > , list < b > , list < c > > unzip3 ( list < t3 < a , b , c > > listabc ) {\\n return t3 . of ( listabc . map ( null ) , listabc . map ( null ) , listabc . map ( null ) ) ;\\n }\"]"
    codes = JSON.parse(codes)
    for(var i=0;i<codes.length;i++)
        codes[i] = {ncode:codes[i].split('\n')};
    return codes
}
export  {
    ncodeKeyIndexHandler,
    genBlankArray,
    getCodeChip
}