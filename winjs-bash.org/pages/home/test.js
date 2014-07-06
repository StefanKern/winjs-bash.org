/// <reference path="../../TestData/bash.org--random.html" />
(function () {
    "use strict";
    WinJS.Utilities.startLog({ type: "info", tags: "custom" });

    WinJS.UI.Pages.define("/pages/home/test.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            
            WinJS.UI.processAll(element).then(function () {
                var vm = {
                    test: "hello ko, it's working",
                    setBinding: function () {
                        vm.binding({
                            comandBarBinding: doRemove
                        });
                    },
                    binding: ko.observable({
                        comandBarBinding: doAdd
                    }),
                }                

                ko.applyBindings(vm);
            });
        }
    });


    function doAdd() {
        WinJS.log("do add", "info", "custom");
    }

    function doRemove() {
        WinJS.log("do Remove", "info", "custom");
    }
})();