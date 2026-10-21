// The archive room is retired; preserve only shared media cleanup hooks.
const albumState={video:false};
function clearAlbumMedia(){albumState.video=false;$('#album-media').replaceChildren();$('#album-watch').hidden=true;$('#album-source').hidden=true}
function syncAlbum(){$('#album-panel').hidden=true;$('#stage-album').hidden=true;syncPartyButtons()}
bootGame();
