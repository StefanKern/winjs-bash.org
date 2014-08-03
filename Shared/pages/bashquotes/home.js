/// <reference path="../../TestData/bash.org--random.html" />
(function () {
    "use strict";
    var appBar,
        _element,
        vm;

    window.nobubble = function (element, event) {
        event.stopPropagation();
    }



    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    dataTransferManager.addEventListener("datarequested", dataRequested);

    function BashQuoteAction(actions) {
        var $actions = actions;
        var self = this;

        var _quoteNumber = $actions.find(":nth-child(1):first")
        this.quoteNumber = _quoteNumber.text();

        this.link = "http://bash.org/" + _quoteNumber.attr("href");

        this.showInBorwser = function () {
            var url = new Windows.Foundation.Uri(self.link);
            Windows.System.Launcher.launchUriAsync(url);
        }

        function MakeVoitingRequest(index) {
            var url = "http://bash.org/" + $actions.find(":nth-child(" + index + "):first").attr("href");

            var msg = new Windows.UI.Popups.MessageDialog(
                "Progressing Upvote");

            $.ajax({
                url: url,
                type: "GET",
                success: function (data) {
                    var $data = $(window.toStaticHTML(data));
                    msg.content = $data.find(".bodytext:first").text();
                    msg.showAsync();
                },
                error: function () {
                    msg.content("Unknown Error");
                    msg.showAsync();
                },
                complete: function () {
                    msg.commands.append(new Windows.UI.Popups.UICommand(
                        "OK"));
                }
            });
        }

        this.upvote = function () {
            MakeVoitingRequest(2);
        }

        this.downvote = function () {
            MakeVoitingRequest(3);
        }

        this.report = function () {
            MakeVoitingRequest(4);
        }


        // http://stackoverflow.com/questions/3442394/jquery-using-text-to-retrieve-only-text-not-nested-in-child-tags
        this.votes = $actions
                .clone()    //clone the element
                .children() //select all the children
                .remove()   //remove all the children
                .end()  //again go back to selected element
                .text();
    }

    // http://css-tricks.com/snippets/javascript/unescape-html-in-js/
    function htmlDecode(input) {
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }

    function BashQuote(element) {
        this.quote = $(element).html();

        this.escapedQuote = htmlDecode(this.quote);

        this.actions = new BashQuoteAction($(element).prev());

    }

    function ViewModel(bashSection) {
        var self = this,
            loadingNext = false;
        this.quotelist = ko.observableArray();

        this.Index = ko.observable(0);

        this.nextQuote = function () {
            console.log("next Quote");
            var index = self.Index();
            index++;
            self.Index(index);
        }

        function loadQuote() {
            loadingNext = true;

            var startTime = Date.now();
            console.log((Date.now() - startTime) + ": Start Loading");

            bashSection = bashSection || "top";

            var appbar = $("#appBar")[0];
            if (appbar) {
                appbar.winControl.hide();
                appbar.winControl.disabled = true;
            }

            $.ajax({
                //url: "../../TestData/bash.org--random.html",
                url: "http://bash.org/?" + bashSection,
                cache: false,
                success: function (data) {
                    self.loadingText("Generating viewmodel");
                    console.log((Date.now() - startTime) + ": Finding elements");

                    var $data = $(window.toStaticHTML(data));
                    var $quote = $data.find(".qt");

                    console.log((Date.now() - startTime) + ": Generating viewmodel");
                    $quote.each(function () {
                        self.quotelist.push(new BashQuote(this));
                    });

                    console.log((Date.now() - startTime) + ": Finished");
                    self.loadingText("Finished");
                },
                error: function () {
                    var msg = new Windows.UI.Popups.MessageDialog(
                        "Request error");
                    msg.commands.append(new Windows.UI.Popups.UICommand(
                        "OK"));
                    msg.showAsync();
                },
                complete: function () {
                    loadingNext = false;

                    self.loadingText("Loading quotes form bash.org...");

                    if (appbar) {
                        appbar.winControl.show();
                        appbar.winControl.disabled = false;
                    }
                }
            });
        }

        this.loadingText = ko.observable("Loading quotes form bash.org...");

        this.currentQoute = ko.computed(function () {
            var index = self.Index();
            var quotes = self.quotelist();
            var quoteLength = quotes.length;

            if (!loadingNext && (index > (quoteLength - 10))) {
                loadQuote();
            }

            return (quoteLength != 0) ?
                quotes[index] : null;
        });

        this.nextQuoteAvalible = ko.computed(function () {
            var index = self.Index();
            var quotes = self.quotelist();
            var quoteLength = quotes.length;

            return index != quoteLength;
        });

        this.nextQuoteNotAvalible = ko.computed(function () {
            return !self.nextQuoteAvalible();
        });


        // Command button functions
        this.ABCShare = function () {
            Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
        }

        this.ABCShowInBrowser = function () {
            self.currentQoute().actions.showInBorwser();
        }

        this.ABCUpvote = function () {
            self.currentQoute().actions.upvote();
        }

        this.ABCdownvote = function () {
            self.currentQoute().actions.downvote();
        }

        this.ABCReport = function () {
            self.currentQoute().actions.report();
        }
    }


    function dataRequested(e) {
        var request = e.request;

        var currentQuote = vm.currentQoute();

        //// Title is required
        var dataPackageTitle = "bash.org quote " + currentQuote.actions.quoteNumber;
        //var dataPackageWebLink = "bash.org quote #" + currentQuote.actions.quoteNumber;
        var quote = currentQuote.escapedQuote;
        var link = currentQuote.actions.link
        request.data.setText(quote + "\n\n" + link);


        request.data.properties.title = dataPackageTitle;
        request.data.properties.description = quote;
    }

    WinJS.UI.Pages.define("/pages/bashquotes/home.html", {
        //unload function of the page navigating away from
        unload: function () {
            ko.cleanNode(_element);
        },
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            _element = element;
            ko.cleanNode(_element);
            vm = new ViewModel(options);;
            ko.applyBindings(vm, _element);


            $("body").swipe({
                swipe: function (event, direction, distance, duration, fingerCount) {
                    //console.log("You swiped " + direction);
                },
                swipeLeft: function () {
                    var index = vm.Index();
                    index++;
                    vm.Index(index);

                    $('body').scrollTop(0);
                },
                swipeRight: function () {
                    var index = vm.Index();
                    index--;
                    if (index >= 0)
                        vm.Index(index);

                    $('body').scrollTop(0);
                }
            });
        }
    });

    function showShareUI() {
        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    }
})();