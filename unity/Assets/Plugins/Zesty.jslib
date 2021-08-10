mergeInto(LibraryManager.library, {
    _open: function(url) {
        window.open(Pointer_stringify(url), "_blank");
    }
})