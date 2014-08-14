
(function () {
    "use strict";


    var appname;

    //(function () {
    //    // http://stackoverflow.com/questions/13627375/how-to-get-the-application-name-by-code
    //    Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("AppxManifest.xml").then(function (file) {
    //        Windows.Storage.FileIO.readTextAsync(file).done(function (text) {
    //            var xdoc = new Windows.Data.Xml.Dom.XmlDocument();
    //            xdoc.loadXml(text);
    //            //appname = xdoc.selectNodesNS("m:Package/m:Applications/m:Application/m:VisualElements",
    //            //    "xmlns:m=\"http://schemas.microsoft.com/appx/2013/manifest\"")[0]
    //            //    .attributes.getNamedItem("DisplayName").nodeValue;

    //            appname = xdoc.selectNodesNS("m:Package/m:Properties/m:DisplayName", "xmlns:m=\"http://schemas.microsoft.com/appx/2010/manifest\"")[0].innerText;

    //        });
    //    });
    //})();

    WinJS.UI.Pages.define("/pages/aboutpage/page.html", {
        //unload function of the page navigating away from
        unload: function () {
        },
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            // http://stackoverflow.com/questions/18311836/winjs-implenting-rate-and-review-in-windows-store-apps
            $('#ratemyapp').click(function () {
                var uriToLaunch = "ms-windows-store:reviewapp?appid=ac241d87-8c4e-41a4-81c6-0902e5d19809";
                var uri = new Windows.Foundation.Uri(uriToLaunch);
                var options = new Windows.System.LauncherOptions();
                options.treatAsUntrusted = true;
                Windows.System.Launcher.launchUriAsync(uri, options).then(
                    function (success) {
                        if (success) {
                        } else {
                        }
                    });
            });

            $('#feedback').click(function () {
                var mailto = new Windows.Foundation.Uri("mailto:?to=stefankern@outlook.com" + "&subject=" + appname + "&body=Hello,%0dWrite me some feedback!");
                Windows.System.Launcher.launchUriAsync(mailto);
            });

        }
    });
})();
