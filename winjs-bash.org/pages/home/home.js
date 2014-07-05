/// <reference path="../../TestData/bash.org--random.html" />
(function () {
    "use strict";

    window.nobubble = function (element, event) {
        event.stopPropagation();
    }

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            function BashQuoteAction(actions) {
                var $actions = actions;

                var _quoteNumber = $actions.find(":nth-child(1):first")
                this.quoteNumber = _quoteNumber.text();

                this.showInBorwser = function () {
                    var url = new Windows.Foundation.Uri("http://bash.org/" + _quoteNumber.attr("href"));
                    Windows.System.Launcher.launchUriAsync(url);
                }

                function MakeVoitingRequest(index){
                    var url = "http://bash.org/" + $actions.find(":nth-child(" + index +"):first").attr("href");

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

            function BashQuote(element) {
                this.quote = $(element).html();

                this.actions = new BashQuoteAction($(element).prev());

            }

            function ViewModel() {
                var self = this,
                    loadingNext = false;
                this.quotelist = ko.observableArray();


                this.Index = ko.observable(0);

                this.nextQuote = function () {
                    console.log("next");
                    var index = self.Index();
                    index++;
                    self.Index(index);
                }


                function loadQuote() {
                    loadingNext = true;
                    $.ajax({
                        //url: "../../TestData/bash.org--random.html",
                        url: "http://bash.org/?random",
                        success: function (data) {

                            var $data = $(window.toStaticHTML(data));
                            var $quote = $data.find(".qt");

                            $quote.each(function () {
                                self.quotelist.push(new BashQuote(this));
                            });
                        },
                        complete: function () {
                            loadingNext = false;
                        }
                    });
                }

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
            }

            var vm = new ViewModel();


            document.getElementById("ABCShare")
                .addEventListener("click", _ABCShare, false);
            document.getElementById("ABCShowInBrowser")
                .addEventListener("click", _ABCShowInBrowser, false);
            document.getElementById("ABCUpvote")
                .addEventListener("click", _ABCUpvote, false);
            document.getElementById("ABCdownvote")
                .addEventListener("click", _ABCdownvote, false);
            document.getElementById("ABCReport")
                .addEventListener("click", _ABCReport, false);
            
            // Command button functions
            function _ABCShare() {
                debugger;
            }

            function _ABCShowInBrowser() {
                vm.currentQoute().actions.showInBorwser();
            }

            function _ABCUpvote() {
                vm.currentQoute().actions.upvote();
            }

            function _ABCdownvote() {
                vm.currentQoute().actions.downvote();
            }

            function _ABCReport() {
                vm.currentQoute().actions.report();
            }



            WinJS.UI.processAll(element).then(function () {
                ko.applyBindings(vm, element);



            });


            //function commandInvokedHandler(command) {
            //    // Display message
            //    WinJS.log && WinJS.log("The '" + command.label + "' command has been selected.",
            //    "sample", "status");
            //}

            //// Create the message dialog and set its content
            //var msg = new Windows.UI.Popups.MessageDialog(
            //    "No internet connection has been found.");

            //// Add commands and set their command handlers
            //msg.commands.append(new Windows.UI.Popups.UICommand(
            //    "Try again"));
            ////msg.commands.append(
            ////    new Windows.UI.Popups.UICommand("Close"));

            //// Set the command that will be invoked by default
            //msg.defaultCommandIndex = 0;

            //// Set the command to be invoked when escape is pressed
            //msg.cancelCommandIndex = 1;

            //// Show the message dialog
            //msg.showAsync();
        }
    });
})();