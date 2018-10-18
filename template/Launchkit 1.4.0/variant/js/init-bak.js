/*!*************************************************************** 
 ***********COPYRIGHT (c) 2015 Medium Rare www.mrare.co **********
 **** unauthorised copying or use elsewhere is not permitted *****
 *****************************************************************/
function Variant() {


    var resizeElement = '',
        elementOptionalClasses, elementOptionalAttributes, nowDate, defaultMasterTarget, defaultPageTarget, templateNameSpace, mrv_masterContentTarget, mrv_pageContentTarget, mrv_masterNavTarget, mrv_pageTarget, mrv_masterFooterTarget, mrv_pageFooterTarget,
        variantElementsNeedRefresh = 'ul.slides > li, .masonry .project',
        variantParentsCauseRefresh = '.grid-layout, .tabbed-content',
        isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    initTargets();

    $(document).bind("mouseup", function(e) {
        //console.log('click target '+e.target);
        // We don't want any child of the element options menu to cause the menu to close because it has switches on it
        if (!$(e.target).closest('.element-context-options-mrv, .variant-section-control-group-mrv').length) {
            if (e.which === 1) {
                $(".variant-context-menu-mrv").hide();
                $(".variant-section-control-mrv").removeClass('variant-active-mrv');
            }
        }
    });

    $(document).ready(function() {
        console.groupCollapsed("Loading Variant...");
        $(window).resize(initSizes);
        initSizes();
        loadSections();
        loadDefaultImages();
        iconPacks = loadIcons();
        loadStateBank();
        loadCustomNavs();
        loadCustomFooters();
        loadColourSchemes();
        loadFonts();
        loadOptionalBodyClasses();
        elementOptionalClasses = loadOptionalELementClasses();
        elementOptionalAttributes = loadOptionalELementAttributes();
        console.groupEnd();

        // Include win-scroll.css for windows webkit scroll bars

        if ((navigator.userAgent.indexOf("NT 6.") != -1)) {
            $('head').append('<style>::-webkit-scrollbar { width: 8px; background-color: rgba(0,0,0,0); -webkit-border-radius: 100px; } ::-webkit-scrollbar-thumb:vertical { background: rgba(0,0,0,0.3); -webkit-border-radius: 100px; } </style>');
        }

        nowDate = new Date();
        $('.variant-year-mrv').text(nowDate.getFullYear());

        $('.tip-holder-mrv').flexslider({
            controlNav: false,
            directionNav: false,
            slideshowSpeed: 4000,
            start: function() {
                $('.tip-holder-mrv').addClass('variant-active-mrv');
            }
        });

        // Small button at bottom left that hides/shows the sidebar

        $('.sidebar-toggle-mrv').click(function() {
            $('.sidebar-tab-content-mrv').toggleClass('sidebar-lock-mrv');
            $('.sidebar-toggle-mrv').toggleClass('toggle-on-mrv');
        });

        $('.variant-page-mrv').click(function() {
            $('.sidebar-modal-mrv').removeClass('show-sidebar-modal-mrv');
        });

        $('.sidebar-modal-mrv .modal-close-mrv').click(function() {
            $(this).closest('.sidebar-modal-mrv').removeClass('show-sidebar-modal-mrv');
        });

        // Hover on sidebar to show it

        $('.variant-sidebar-mrv').mouseenter(function() {
            $('.sidebar-tab-content-mrv').removeClass('initial-lock-mrv');
        });

        $('.sidebar-tabs-mrv li').click(function() {
            $('.sidebar-tabs-mrv li').removeClass('variant-active-mrv');
            $(this).addClass('variant-active-mrv');
            var tabIndex = $(this).index() + 1;
            $('.sidebar-pane-mrv').removeClass('variant-active-mrv');
            $('.sidebar-pane-mrv:nth-child(' + tabIndex + ')').addClass('variant-active-mrv');
        });


        // Start new page and load previous page buttons on startup
        $('.load-previous-page-mrv').click(function() {
            $('.load-previous-page-mrv').addClass('variant-hidden-mrv');
            loadState();
        });

        $('.start-new-page-mrv').click(function() {
            $.localStorage(templateNameSpace + '.state.last-state-id-mrv', '');
            $.localStorage(templateNameSpace + '.state.last-name-mrv', '');
            $('.startup-button-mrv').addClass('variant-hidden-mrv');
            $('.add-section-button-mrv').trigger('click');
            $('.sidebar-tab-content-mrv').addClass('initial-lock-mrv');
        });

        // Plus symbol "Add section" button to open the sections thumbnail modal
        $('.add-section-button-mrv').click(function() {
            promptSection();
            $('.section-thumbs-container-mrv').click();
            $('.sidebar-content-mrv').toggleClass('blocks-shown-mrv');
            $('.sidebar-content-mrv').find('.style-switcher-mrv').removeClass('variant-active-mrv');
            initSizes();
        });

        // Open add section filters

        $('.filters-title-mrv').click(function() {
            $('.section-filters-mrv').toggleClass('variant-active-mrv');
            $(this).toggleClass('variant-active-mrv');
        });

        $('.section-filter-mrv').click(function() {
            $('.section-filters-mrv').removeClass('variant-active-mrv');
            $('.filters-title-mrv').removeClass('variant-active-mrv');
        });

        // Small cog icon that opens the settings modal
        $('.show-settings-mrv').click(function() {
            openSettingsModal();
        });

        // This was replaced by the nav options on the style tab - see loadOptionalNavClasses	
        $('.meta-nav-mrv').each(function() {

            var navName = $(this).data('nav-name-mrv'),
                navID = $(this).attr('id');

            $('.nav-options-list-mrv').append('<li class="nav-option-mrv" nav-id="' + navID + '" variant-origin-mrv="variant-original-mrv">' + $(this).attr('data-nav-name-mrv') + '</li>');

        });

        // Populate footer options with all those in the footer bank
        $('#footer-bank-mrv .variant-meta-mrv').each(function() {
            var footName = $(this).attr('data-section-name-mrv'),
                footID = $(this).attr('id');

            $('.footer-options-list-mrv').append('<li class="footer-option-mrv" variant-footer-id-mrv="' + footID + '" variant-origin-mrv="variant-original-mrv">' + footName + '</li>');

        });

        // Editing the page title also updates it if it exists in the state bank
        $('.input-page-title-mrv').on('blur keyup paste input', function() {
            document.title = $(this).text();
            if ($.localStorage(templateNameSpace + '.state.last-state-id-mrv')) {
                $('#state-bank-mrv [variant-saved-state-mrv="' + $.localStorage(templateNameSpace + '.state.last-state-id-mrv') + '"]').attr('page-title', $(this).text());
                $.localStorage(templateNameSpace + '.state.state-bank-mrv', $('#state-bank-mrv').html());
            } else {
                $.localStorage(templateNameSpace + '.state.page-title-mrv', $(this).text());
            }
            saveState();
        });

        // If it is a new page, reset the last state ID
        $('.input-page-title-mrv.variant-new-page-mrv').on('click focus blur keyup paste input', function() {
            $.localStorage(templateNameSpace + '.state.last-state-id-mrv', '');
            $.localStorage(templateNameSpace + '.state.last-name-mrv', '');
            $('.startup-button-mrv').addClass('variant-hidden-mrv');
            $(this).removeClass('variant-new-page-mrv');
        });


        $('.section-option-button-mrv').click(promptCustomOption);
        $('.element-option-button-mrv').click(promptCustomOption);


        $('.save-nav-button-mrv').on('click', function() {
            saveNav();
            $.modal.close();
        });

        $('.save-nav-name-mrv').keyup(function(e) {
            if (e.keyCode === 13) {
                if ($('.save-nav-name-mrv').val() != "") {
                    saveNav();
                    $.modal.close();
                }
            }
        });

        $('.save-footer-button-mrv').on('click', function() {
            if ($('.save-footer-name-mrv').val() != "") {
                saveFooter();
                $.modal.close();
            }
        });

        $('.save-footer-name-mrv').keyup(function(e) {
            if (e.keyCode === 13) {
                if ($('.save-footer-name-mrv').val() != "") {
                    saveFooter();
                    $.modal.close();
                }
            }
        });

        $('.save-page-name-mrv').keyup(function(e) {
            if (e.keyCode === 13) {

                if ($('.save-page-name-mrv').val() != "") {
                    saveStateAs();
                    $.modal.close();
                }

            }
        });

        $('.save-page-button-mrv').on('click', function() {
            if ($('.save-page-name-mrv').val() != "") {
                saveStateAs();
                $.modal.close();
            }
        });

        // Check if saved pages has children, if so remove empty class

        if ($('.saved-pages-holder-mrv').find('.load-page-button-mrv').length) {
            $('.saved-pages-holder-mrv').removeClass('empty-saved-pages-holder-mrv');
        }

        $('.edit-link-save-button-mrv').on('click', function() {
            setLinkHref();
            $.modal.close();
        });

        $('.edit-link-href-mrv').keyup(function(e) {

            if (e.keyCode === 13) {
                if ($('.edit-link-href-mrv').val() != "") {
                    setLinkHref();
                    $.modal.close();
                }

            }
        });

        $('.inner-link-options-mrv').change(function(e) {
            $('.edit-link-href-mrv').val($(this).val());
        });

        $('.edit-image-save-button-mrv').on('click', function() {
            setImageSrc();
            $.modal.close();
        });

        $('.custom-detail-save-button-mrv').on('click', function() {
            saveCustomOption();
            $.modal.close();
        });

        $('.custom-detail-input-mrv').keyup(function(e) {
            if (e.keyCode === 13) {
                saveCustomOption();
                $.modal.close();
            }
        });

        $('.edit-video-save-button-mrv').on('click', function() {
            setVideoSrc();
            $.modal.close();
        });

        $('.edit-image-src-mrv, .edit-image-alt-mrv').keyup(function(e) {
            if (e.keyCode === 13) {
                setImageSrc();
                $.modal.close();
            }
        });

        $('.edit-image-src-mrv').get(0).addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var imageUrl = e.dataTransfer.getData('URL');
            $('.edit-image-src-mrv').val(imageUrl);
            $('.editing-image-preview-mrv').attr('src', imageUrl);
        }, false);
        $('.editing-image-preview-mrv').get(0).addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var imageUrl = e.dataTransfer.getData('URL');
            $('.edit-image-src-mrv').val(imageUrl);
            $('.editing-image-preview-mrv').attr('src', imageUrl);
        }, false);
        $('.edit-image-src-mrv').get(0).addEventListener('dragover', function(evt) {
            evt.preventDefault();
            evt.stopPropagation()
        }, false);

        $('.edit-mp4-src-mrv, .edit-webm-src-mrv, .edit-ogv-src-mrv').keyup(function(e) {
            if (e.keyCode === 13) {
                setVideoSrc();
                $.modal.close();
            }
        });

        // Open Sidebar lists
        $('.style-switcher-mrv span').click(function() {
            $(this).closest('.style-switcher-mrv').toggleClass('variant-active-mrv');
            setTimeout(function() {
                initSizes();
            }, 301);
        });

        $('.save-page-as-button-mrv').click(function() {
            promptSaveState();
            $('.saved-pages-holder-mrv').removeClass('empty-saved-pages-holder-mrv');
        });

        $('.import-button-mrv').click(function() {
            $('.import-page-files-mrv').focus().trigger('click');
        });

        $('.import-page-files-mrv').change(function(e) {
            // Get the extgension from the filename value of the input
            if ($(this).val().split('.').pop() == "variant") {
                importState(e);
            } else {
                variantAlert('Please select a .variant file', 'Variant cannot import plain HTML files. <br /><br />You can import .variant files that have been exported from Variant here, or by someone else.');
            }
        });

        $('.export-all-button-mrv').click(function() {
            exportState('all');
        });

        $('.no-nav-mrv').click(function() {
            $('.variant-nav-options-mrv').closest('.options-switcher-mrv').remove();
            $('#master-html-mrv nav').remove();
            $(this).closest('.style-switcher-mrv').removeClass('variant-active-mrv');
            var newTitle = $(this).text();
            $(this).closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(newTitle);
            saveState();
            refresh();
        });

        $('.no-footer-mrv').click(function() {
            $('#master-html-mrv footer').remove();
            $(this).closest('.style-switcher-mrv').removeClass('variant-active-mrv');
            var newTitle = $(this).text();
            $(this).closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(newTitle);
            saveState();
            refresh();
        });


        // Give the "Show Trashed" button a class of "Hide Trashed" when it is clicked.  This prevents the need for a second button.
        $(document).on('click', '.show-trashed-button-mrv', function() {
            $('.variant-deleted-mrv').toggleClass('variant-deleted-mrv variant-show-deleted-mrv');
            $(this).toggleClass('variant-active-mrv hide-trashed-button-mrv show-trashed-button-mrv');
        });

        $(document).on('click', '.hide-trashed-button-mrv', function() {
            $('.variant-show-deleted-mrv').toggleClass('variant-deleted-mrv variant-show-deleted-mrv');
            $(this).toggleClass('show-trashed-button-mrv hide-trashed-button-mrv variant-active-mrv');
        });

        $('.toggle-chooser-button-mrv').click(function() {
            $('.image-edit-chooser-mrv,.edit-image-modal-mrv').toggleClass('variant-active-mrv');
        });

        $('.editing-image-preview-mrv').click(function() {
            $('.toggle-chooser-button-mrv').trigger('click');
        });

        $('.edit-image-chooser-files-mrv').change(function(e) {
            updateChooserList(e);
        });

        $('.import-images-button-mrv').click(function() {
            $('.edit-image-chooser-files-mrv').focus().trigger('click');
        });


        // Check if generateSource function exists, and if not, show a modal to explain
        // because it means user must currently be in demo mode which excludes this function.
        try {
            if ($.isFunction(generateSource)) {

            }
        } catch (e) {
            $('.variant-purchase-button-mrv').removeClass('variant-hidden-mrv');
            $('.get-source-button-mrv, .all-html-button-mrv, .single-html-button-mrv').click(function() {
                variantAlert('Demo Only', 'Getting HTML in the demo is disabled.<br /><br />You may export your page in a .variant file and import it when you <a href="#purchase-template" target="_blank">purchase the full version</a>.');
            });
        }

        /*variant-remove-from-demo-start*/

        $('.instructions-modal-mrv').remove();

        $('.get-source-button-mrv').click(function() {

            var input = $('#master-html-mrv').clone(),
                title = document.title,
                font = $('.variant-font-options-list-mrv').attr('variant-current-font-mrv'),
                bodyClasses = (typeof $('#variant-body-classes-mrv').attr('class') != 'undefined' ? $('#variant-body-classes-mrv').attr('class') : "");
            output = generateSource(input, title, font, bodyClasses);

            $('.page-code-mrv').html('');
            $('.page-code-mrv').append(output);

            $('.get-source-modal-mrv').modal({
                autoResize: true,
                overlayClose: true,
                opacity: 0,
                overlayCss: {
                    "background-color": "#3e3e3e"
                },
                closeClass: 'modal-close-mrv',
                onShow: function() {
                    switch (window.location.protocol) {
                        case 'http:':
                        case 'https:':
                        case 'file:':
                            $('.select-all-code-button-mrv').click(function() {
                                $('.page-code-mrv').select();
                            });
                            $('.select-all-code-button-mrv').show();
                            $('.code-copy-simple').show();
                            $('.page-code-mrv').select();

                            break;
                        default:


                    }
                    setTimeout(function() {
                        $('.simplemodal-container').addClass('fade-modal-mrv');
                        $('.simplemodal-overlay').addClass('fade-modal-mrv');
                    }, 100);
                    initSizes();
                },
                onClose: function() {
                    setTimeout(function() {
                        $.modal.close();
                        initSizes();
                    }, 300);
                    $('.simplemodal-container').removeClass('fade-modal-mrv');
                    $('.simplemodal-overlay').removeClass('fade-modal-mrv');
                }
            });

            if ($.localStorage(templateNameSpace + '.default.images-mrv') != '') {
                $.localStorage(templateNameSpace + '.default.images-mrv', $('#image-edit-chooser').attr('default-images-mrv'));
            }

        });

        $('.single-html-button-mrv').click(function() {
            var pageName = '',
                pageContent = '',
                blob;

            pageName = $.localStorage(templateNameSpace + '.state.last-name-mrv');

            pageName = typeof $.localStorage(templateNameSpace + '.state.last-name-mrv') !== 'undefined' ? $.localStorage(templateNameSpace + '.state.last-name-mrv') : "page";

            pageContent = $('.page-code-mrv').val();
            blob = new Blob([pageContent], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, convertToSlug(pageName) + ".html");
        });

        $('.all-html-button-mrv').click(function() {

            var zip = new JSZip(),
                stateIDs = [],
                time = new Date(),
                zipName, stateHTML, stateMap, exported, exportString, blob;

            if (!$('#state-bank-mrv .variant-saved-state-mrv').length) {
                variantAlert('Export HTML', 'There was nothing to export.<br /><br />Save at least one page before exporting.');
                return;
            }

            $('#state-bank-mrv .variant-saved-state-mrv').each(function() {
                stateIDs.push($(this).attr('variant-saved-state-mrv'));
            });
            zipName = 'variant-exported-' + convertToSlug(time.toDateString());

            stateIDs.forEach(function(thisStateID, index) {

                var stateHTML, sourceDiv, font, bodyClasses, sourceTextArea, pageName, pageTitle;
                time = new Date()
                pageName = $('#state-bank-mrv [variant-saved-state-mrv="' + thisStateID + '"]').attr('variant-state-name-mrv');
                pageTitle = $('#state-bank-mrv [variant-saved-state-mrv="' + thisStateID + '"]').attr('page-title');
                font = (typeof $.localStorage(templateNameSpace + '.state.font-option-mrv.' + thisStateID) != 'undefined' ? $.localStorage(templateNameSpace + '.state.font-option-mrv.' + thisStateID) : "");
                bodyClasses = (typeof $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + thisStateID) != 'undefined' ? $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + thisStateID) : "");
                stateHTML = $.localStorage(templateNameSpace + '.state.master-html-mrv.' + thisStateID);
                sourceDiv = $('<div id="variant-temp-source-mrv" />').html(stateHTML);
                sourceTextArea = $('<textarea id="variant-temp-textarea-mrv" />').append(generateSource(sourceDiv, pageTitle, font, bodyClasses));
                pageName = $('#state-bank-mrv [variant-state-name-mrv="' + pageName + '"]').length == 1 ? convertToSlug(pageName) + ".html" : convertToSlug(pageName) + '-' + time.getTime() + ".html";
                zip.file(pageName, sourceTextArea.val());
            });

            blob = zip.generate({
                type: "blob",
                compression: "deflate"
            });
            saveAs(blob, 'html-pages-' + convertToSlug(time.toDateString()) + '.zip');
        });


        function generateSource(source, title, font, bodyClasses) {
            var body = source,
                head, content, foot, output, disposableSelectors = "",
                bodyClassesHead;

            // Create list of disposable selector classes used in creation of element class options or elsewhere
            if (elementOptionalClasses.options) {
                elementOptionalClasses.options.forEach(function(option) {
                    if (typeof option.disposableSelector !== "undefined") {

                        // Classes will have a . symbol for purposes of selection
                        disposableSelectors = disposableSelectors + " " + option.disposableSelector.replace('.', "");
                    }
                });

            }

            body.find('h1:empty, h2:empty, h3:empty, h4:empty, h5:empty, h6:empty, a:empty, p:empty, span:empty, li:empty, em:empty, strong:empty, blockquote:empty, figcaption:empty, table:empty').not('.in-page-link').addClass('variant-deleted-mrv');
            body.find('.variant-deleted-mrv, .variant-show-deleted-mrv').each(function() {
                recursiveDelete($(this));
            });

            body.find('div.row:not(:has(>div, >p, >h1, >h2, >h3, >h4, >h5, >h6, >span, >ul, >li, >strong, >em, >a, >i, >img, >figure, >video, >iframe, >form, >input, >textarea, >blockquote, >figcaption, >table, >form))').remove();
            body.find('.variant-sortable-mrv:not(:has(>div, >p, >h1, >h2, >h3, >h4, >h5, >h6, >span, >ul, >li, >strong, >em, >a, >i, >img, >figure, >video, >iframe, >form, >input, >textarea, >blockquote, >figcaption, >table, >form))').remove();

            // The list of elements with possible variant-specific classes added to them:
            $(body).find('p, span, li, ul, h1, h2, h3, h4, h5, h6, nav, header, footer, strong, em, a, section, div, i, img, figure, video, iframe, form, input, textarea, blockquote, figcaption, tbody, tr, td, th').removeClass('variant-undeleted-mrv variant-show-deleted-mrv').removeClass('variant-custom-mrv').removeClass('variant-original-mrv').alterClass('variant-editable-*', '').alterClass('variant-*', '').removeClass('variant-sortable-mrv').removeClass('variant-placeholder-mrv').removeClass('lightbox-gallery-mrv').removeClass('lightbox-thumbnail-mrv').removeClass('variant-thumbnail-mrv').removeClass('lightbox-link-mrv').removeClass('variant-disable-link-mrv').removeClass('hovered-on-mrv').removeAttr('variant-editable-mrv').removeClass('variant-not-editable-mrv').removeClass('variant-ignore-mrv').removeClass('variant-molecule-mrv').removeAttr('variant-inner-link-name-mrv').removeAttr('variant-inner-links-to-mrv').removeAttr('contenteditable').removeAttr('data-variant-option-mrv').removeAttr('data-variant-optional-classes-mrv').removeAttr('variant-closest-mrv').removeAttr('variant-also-mrv').removeAttr('variant-iframe-mrv').removeAttr('style').removeAttr('nav-id').removeClass('ui-sortable').removeClass(disposableSelectors).removeClass('variant-disable-clone-mrv').removeClass('variant-active-slider-mrv');
            $(body).find('nav').alterClass('variant-custom-nav-mrv-*', '').removeAttr('variant-custom-nav-mrv').removeAttr('variant-nav-name-mrv').removeAttr('style');
            $(body).find('footer').alterClass('variant-custom-footer-mrv-*', '').removeAttr('variant-custom-footer-mrv').removeAttr('variant-footer-name');
            $(body).find('*[class=""]').removeAttr('class');
            head = $('#variant-style-original-mrv').html();
            head = String(head).replace('[title]', title);

            if ($('[variant-current-css-mrv]').length) {
                head = String(head).replace($('[variant-original-css-mrv]').attr('variant-original-css-mrv'), $('[variant-current-css-mrv]').attr('variant-current-css-mrv'));
            }
            bodyClassesHead = replaceBodyClasses(head, bodyClasses);
            head = bodyClassesHead ? bodyClassesHead : head;

            head = appendFontOptionToHead(head, font);

            content = $(body).html().replace(/\n/g, '\n\t\t')
                .replace(/\n\n/g, '\n')
                //.replace(/<\/tr><tr>/g,'</tr>\n<tr>')
                .replace(/\n\t\t><section/g, '>\n\t\t\t<section')
                .replace(/\n\t\t<header/g, '\n\t\t\t<header')
                .replace(/\t\t\t<\/header></g, '\t\t\t</header>\n\t\t\t<')
                .replace(/\t\t\t<\/section></g, '\t\t\t</section>\n\t\t\t<')
                .replace(/<\/a><section/g, '</a>\n\t\t\t\n\t\t\t<section')
                .replace(/<\/a><header/g, '</a>\n\t\t\t\n\t\t\t<header')
                .replace(/<\/section>\n\t\t\t<a/g, '</section>\n\t\t\t\n\t\t\t<a')
                .replace(/<\/header>\n\t\t\t<a/g, '</header>\n\t\t\t\n\t\t\t<a')
                .replace(/\t\t\t<\/section>\n\t\t\t<\/div>/g, '\t\t\t</section>\n\t\t</div>')
                .replace(/\t\t\t<\/header>\n\t\t\t<\/div>/g, '\t\t\t</header>\n\t\t</div>')
                .replace(/\t\t\t<\/header>\n\t\t\t<section/g, '\t\t\t<\/header>\n\t\t\t\n\t\t\t<section')
                .replace(/\t\t\t<\/section>\n\t\t\t<header/g, '\t\t\t<\/section>\n\t\t\t\n\t\t\t<header')
                .replace(/\t\t\t<\/section>\n\t\t\t<section/g, '\t\t\t<\/section>\n\t\t\t\n\t\t\t<section')
                .replace(/\t\t\t<\/header>\n\t\t\t<header/g, '\t\t\t<\/header>\n\t\t\t\n\t\t\t<header');
            content = htmlEntities(content);
            foot = $('#variant-foot-mrv').html();
            head = addIconPacksToHead(head, content, foot);
            output = String(head + content + foot);
            output = String(output).replace(/\.\.\/img\//g, 'img/').replace(/\.\.\/video\//g, 'video/').replace(/delay-src/g, 'src').replace(/no-src/g, 'src');
            //output		= makeReadable(output);
            return output;
        }

        /*variant-remove-from-demo-end*/

        $('.clear-navs-button-mrv').click(function() {
            $('.nav-options-list-mrv [variant-origin-mrv="variant-custom-mrv"]').remove();
            $('#custom-nav-bank-mrv').html('');
            $.localStorage(templateNameSpace + '.custom-navs-mrv', '');
            $('.clear-navs-button-mrv').html('Cleared').removeClass('button-red-mrv').addClass('button-green-mrv');

            setTimeout(function() {
                $('.clear-navs-button-mrv').html('Clear Navs').removeClass('button-green-mrv').addClass('button-red-mrv');
            }, 1500);

        });

        $('.clear-footers-button-mrv').click(function() {
            $('.footer-options-list-mrv [variant-origin-mrv="variant-custom-mrv"]').remove();
            $.localStorage(templateNameSpace + '.custom-footers-mrv', '');
            $('.clear-footers-button-mrv').html('Cleared').removeClass('button-red-mrv').addClass('button-green-mrv');

            setTimeout(function() {
                $('.clear-footers-button-mrv').html('Clear Footers').removeClass('button-green-mrv').addClass('button-red-mrv');
            }, 1500);

        });

        $('.clear-pages-button-mrv').click(function() {
            var io;
            $('#state-bank-mrv li').each(function() {
                var stateID = $(this).attr('variant-saved-state-mrv'),
                    io;
                io = $.localStorage.io(templateNameSpace + '.state.master-html-mrv.' + stateID);
                io.remove();
                io = $.localStorage.io(templateNameSpace + '.state.layout-map-mrv.' + stateID);
                io.remove();
                $(this).remove();
            });

            $('.saved-pages-holder-mrv div').remove();
            $('.saved-pages-holder-mrv').addClass('empty-saved-pages-holder-mrv');
            io = $.localStorage.io(templateNameSpace + '.state.master-html-mrv');
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.layout-map-mrv');
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.page-title-mrv');
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.last-state-id-mrv');
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.last-name-mrv');
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.state-bank-mrv');
            io.remove();

            $('.clear-pages-button-mrv').html('Cleared').removeClass('button-red-mrv').addClass('button-green-mrv');
            setTimeout(function() {
                $('.clear-pages-button-mrv').html('Clear Pages').removeClass('button-green-mrv').addClass('button-red-mrv');
            }, 1500);

        });

        $('.clear-cache-button-mrv').click(function() {
            $('.saved-pages-holder-mrv div').remove();
            $('#state-bank-mrv li').remove();
            window.localStorage.clear();
            $('.clear-cache-button-mrv').html('Cleared').removeClass('button-red-mrv').addClass('button-green-mrv');
            setTimeout(function() {
                $('.clear-cache-button-mrv').html('Rebooting').removeClass('button-green-mrv').addClass('button-red-mrv');
                window.location.reload();
            }, 1500);

        });

        $('img').on('dragstart', function(event) {
            event.preventDefault();
        });

        // Stop forms in the template from submitting when submit button clicked
        $(document).on('submit', '.variant-page-mrv form', function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        });


        // Section filters - the tags above the section thumbnails that filter sections
        $(document).on('click', '.section-filter-mrv', function() {
            $('.section-filter-mrv').removeClass('variant-active-mrv');
            $(this).addClass('variant-active-mrv');
            if ($(this).attr('data-filter-mrv') == "*") {
                $('.section-thumb-mrv').removeClass('variant-hidden-mrv');
                $('.filters-title-mrv span').text('All');
                return;
            }

            $('.section-thumb-mrv').addClass('variant-hidden-mrv');
            $('.section-thumb-mrv[data-filter-mrv*="' + $(this).attr('data-filter-mrv') + '"]').removeClass('variant-hidden-mrv');

            var newTitle = $(this).text();
            $('.filters-title-mrv span').text(newTitle);

            initSizes();
        });

        $(document).on('click', '.delete-nav-button-mrv', function() {
            var navID = $(this).parent().attr('nav-id');
            $(this).parent().remove();
            $('.' + navID).remove();

            updateCustomNavs();
        });

        $(document).on('click', '.delete-footer-button-mrv', function() {
            var footerID = $(this).parent().attr('variant-footer-id-mrv');
            $(this).parent().remove();
            $('.' + footerID).remove();
            updateCustomFooters();
        });

        $(document).on('click', '.load-page-button-mrv', function() {
            loadState($(this).attr('state-id'), $(this).attr('variant-state-name-mrv'));
        });


        $(document).on('click', '.export-page-button-mrv', function() {
            exportState($(this).parent().attr('state-id'));
            return false;
        });

        $(document).on('click', '.nav-option-mrv', function() {
            switchNav($(this).attr('nav-id'), $(this).attr('variant-origin-mrv'));
            $(this).closest('.style-switcher-mrv').removeClass('variant-active-mrv');
            var newTitle = $(this).text();
            $(this).closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(newTitle);
        });

        $(document).on('click', '.footer-option-mrv', function() {
            switchFooter($(this).attr('variant-footer-id-mrv'), $(this).attr('variant-origin-mrv'));
            $(this).closest('.style-switcher-mrv').removeClass('variant-active-mrv');
            $('.startup-button-mrv').addClass('variant-hidden-mrv');
            var newTitle = $(this).text();
            $(this).closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(newTitle);
        });

        $(document).on('click', '.delete-section-button-mrv', function() {

            var deleteID = $(this).attr('data-section-id-mrv');
            $('#master-html-mrv .' + deleteID).remove();
            $('[variant-inner-links-to-mrv=' + deleteID + ']').remove();
            $(this).parent().remove();
            refresh();

            if (!$('.layout-map-mrv').find('.added-section-mrv').length) {
                $('.layout-map-mrv').addClass('empty-layout-map-mrv');
            } else {
                $('.layout-map-mrv').removeClass('empty-layout-map-mrv');
            }

            initSizes();

        });

        /* TOOK THIS OUT BECAUSE WE HAVE REWRITTEN THE ACTIONS CONTAINER HTML
        $(document).on('click', '.actions-container', function(){
        	$(this).parent().find('span').trigger('focus');
        }); */

        $(document).on('click', '.nav-class-option-button-mrv', function() {

            var allNavs = $('.' + $('.variant-page-mrv nav').attr('variant-editable-mrv'));
            $('.meta-nav-mrv').each(function() {
                var navClasses = $(this).data('nav-classes-mrv');

                navClasses.forEach(function(navClass) {
                    allNavs.removeClass(navClass.className);
                });
            });
            allNavs.addClass($(this).attr('nav-class'));
            saveState();
            refresh();
        });

        $(document).on('blur keyup paste input', '.variant-page-mrv [contenteditable], .variant-page-mrv strong', function(e) {

            if (e.type == "paste") {
                e.preventDefault();
                var text = (e.originalEvent || e).clipboardData.getData('text/plain').replace(/\n/g, "<br>");
                document.execCommand('insertHtml', false, text);
            }

            if (!$(this).children().length) {
                if ($(this).text() === "") {
                    console.log('Replacing emptiness in ' + $(this).attr('variant-editable-mrv') + ' with a space \" \"');
                    $(this).text(" ");
                }
            } else if ($(this).html() === "") {
                console.log('Replacing emptiness in ' + $(this).attr('variant-editable-mrv') + ' with a space & nbsp ;');
                $(this).html("&nbsp;");
            }

            $('#master-html-mrv .' + $(this).attr('variant-editable-mrv')).html($(this).html());
            saveState();
        });

        $(document).on('keydown', '.variant-page-mrv [contenteditable]', function(e) {
            // trap the return key being pressed
            if (e.keyCode === 13) {
                if (handleReturnKey(e))
                    return true;
                else
                    return false;
            }

        });

        $(document).on('blur keyup paste input', '.variant-original-mrv', function() {
            $(this).removeClass('variant-original-mrv').addClass('variant-custom-mrv');
        });

        $(document).on('keyup paste input', 'nav.variant-original-mrv', function() {
            promptSaveNav($(this));
        });

        $(document).on('keyup paste input', '.added-section-mrv span', function(e) {
            if (e.keyCode === 13) {
                e.stopPropagation();
                return false;
            } else {
                updateInPageNav($(this));
                return true;
            }

        });

        $(document).on('keydown', '.added-section-mrv span', function(e) {
            if (e.keyCode === 13) {
                e.stopPropagation();
                return false;
            }
        });

        $(document).on('keyup paste input', 'nav.variant-custom-mrv', function() {
            updateCustomNavs();
        });

        $(document).on('keyup paste input', '.save-nav-name-mrv', function() {
            if ($(this).val() != '') {
                $('.save-nav-button-mrv').removeClass('variant-hidden-mrv');
            } else {
                $('.save-nav-button-mrv').addClass('variant-hidden-mrv');
            }
        });

        $(document).on('keyup paste input', 'footer.variant-original-mrv', function() {
            promptSaveFooter($(this));
        });

        $(document).on('keyup paste input', 'footer.variant-custom-mrv', function() {
            updateCustomFooters();
        });

        $(document).on('keyup paste input', '.save-footer-name-mrv', function() {
            if ($(this).val() != '') {
                $('.save-footer-button-mrv').show();
            } else {
                $('.save-footer-button-mrv').hide();
            }
        });

        $(document).on('keyup paste input', '.save-page-name-mrv', function() {
            if ($(this).val() != '') {
                $('.save-page-button-mrv').removeClass('variant-hidden-mrv');
            } else {
                $('.save-page-button-mrv').addClass('variant-hidden-mrv');
            }
        });


        $('.variant-page-mrv').on('mouseenter', 'p , span, a, h1, h2, h3, h4, h5, h6, strong, em, li, ul, div, i, img, input, textarea, blockquote, figcaption, td, th', function() {
            $(this).addClass('hovered-on-mrv');
        });


        $('.variant-page-mrv').on('mouseleave', 'p , span, a, h1, h2, h3, h4, h5, h6, strong, em, li, ul, div, i, img, input, textarea, blockquote, figcaption, td, th, .variant-image-wrapper-mrv', function() {
            $(this).removeClass('hovered-on-mrv');
        });

        $('.variant-page-mrv').on('mouseenter', 'section, header, footer', function() {
            populateSectionControls($(this).attr('variant-editable-mrv'));
        });

        $(document).on('mouseenter', '[variant-editable-mrv] [class*="medium-"]', function(e) {
            resizeElement = $(this).attr('variant-editable-mrv');
            //console.log('Set resizeElement to: '+resizeElement);
        });

        $(document).on('mouseenter', '[variant-editable-mrv] [class*="col-md-"]', function(e) {
            resizeElement = $(this).attr('variant-editable-mrv');
            //console.log('Set resizeElement to: '+resizeElement);
        });

        $(document).on('mouseenter', '[variant-editable-mrv] [class*="col-sm-"]:not([class*="col-md-"])', function(e) {
            resizeElement = $(this).attr('variant-editable-mrv');
            //console.log('Set resizeElement to: '+resizeElement);
        });

        $(document).on('mouseenter', '[variant-editable-mrv] [class*="col-xs-"]:not([class*="col-md-"])', function(e) {
            resizeElement = $(this).attr('variant-editable-mrv');
            //console.log('Set resizeElement to: '+resizeElement);
        });

        $(document).on('keyup', document, function(e) {
            if (resizeElement.length && e.ctrlKey) {
                if (e.keyCode === 219) {
                    console.log('Keystroke decreasing width of element: ' + resizeElement);
                    decreaseWidth(resizeElement);
                }
                if (e.keyCode === 221) {
                    console.log('Keystroke increasing width of element: ' + resizeElement);
                    increaseWidth(resizeElement);
                }
            }

        });

        $(document).on('click', 'a.variant-not-editable-mrv', function(e) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        });

        /***********************************************************************************************************/
        /*  HANDLE IMAGE BUTTON ADDITION AND REMOVAL IN IMAGES, BACKGROUND-IMAGE-HOLDERS, SLIDES AND IFRAME MEDIA  */

        $(document).on('mouseenter', '.variant-page-mrv img:not(.variant-page-mrv .slides > li > img, .variant-molecule-mrv img )', function(e) {
            console.log('[icon-button-for-mrv=' + $(this).attr('variant-editable-mrv') + ']');
            if (!$('[icon-button-for-mrv="' + $(this).attr('variant-editable-mrv') + '"]').length) {
                //if(!$(this).parent().find('.round-icon-button-mrv').length){
                addEditImageButton($(this).attr('variant-editable-mrv'), $(this).attr('variant-editable-mrv'));
            }
        });

        // For all background image holders that are not direct children of header, section, image...
        // -- Look at all bootstrap columns 
        $(document).on('mouseenter', '.variant-page-mrv div[class*="col-"]', function(e) {
            var column = $(this);

            // When entering this <div class="col-*"> look for all background image holders (should only ever be one per column) 
            // and exclude slide backgrounds, molecules, and direct [section, header, footer] children as they are already taken care of with the section controls image button.
            column.find('.image-holder, .background-image-holder:not(.variant-molecule-mrv .background-image-holder, .variant-page-mrv .slides > li > img, .variant-page-mrv .slides > li > .background-image-holder, .variant-page-mrv section > .background-image-holder, .variant-page-mrv header > .background-image-holder, .variant-page-mrv footer > .background-image-holder)').each(function() {

                var imageHolder = $(this);

                if (imageHolder.closest('div[class*="col-"]').find('div.hover-state').length && !imageHolder.closest('div[class*="col-"]').find('div.hover-state').find('.round-icon-button-mrv').length) {
                    if (!$('[icon-button-for-mrv="' + imageHolder.find('img').attr('variant-editable-mrv') + '"]').length) {
                        addEditImageButton(imageHolder.find('img').attr('variant-editable-mrv'), imageHolder.closest('div[class*="col-"]').find('.hover-state').attr('variant-editable-mrv'));
                    }
                } else if (!imageHolder.find('.round-icon-button-mrv').length) {
                    if (!$('[icon-button-for-mrv="' + imageHolder.find('img').attr('variant-editable-mrv') + '"]').length) {
                        addEditImageButton(imageHolder.find('img').attr('variant-editable-mrv'), imageHolder.attr('variant-editable-mrv'));
                    }
                }
            });

        });

        $(document).on('mouseenter', '.variant-page-mrv .embed-video-container:not(.variant-molecule-mrv .embed-video-container, .variant-page-mrv .slides > li > .embed-video-container), .variant-page-mrv .media-embed-container:not(.variant-molecule-mrv .media-embed-container, .variant-page-mrv .slides > li > .media-embed-container)', function() {
            var buttonWrapper = $('<div class="icon-buttons-wrapper-mrv"></div>'),
                iframe = $(this).find('iframe');
            elementOptionalAttributes.options.forEach(function(option) {
                if (iframe.is(option.selector)) {
                    // Set appendTarget false to receive the button rather than having it appended elsewhere.
                    attributeButton = createAttributeButton(option, false, iframe.attr('variant-editable-mrv'));
                    buttonWrapper.append(attributeButton);
                }
            });
            iframe.closest('.embed-video-container, .media-embed-container').append(buttonWrapper);

        });

        $(document).on('mouseenter', '.variant-page-mrv .local-video-container video:not(.variant-molecule-mrv .local-video-container video, .variant-page-mrv .slides > li > .local-video-container video)', function() {
            var buttonWrapper = ($(this).closest('.local-video-container').find('.icon-buttons-wrapper-mrv').length ? $(this).closest('.local-video-container').find('.icon-buttons-wrapper-mrv') : $('<div class="icon-buttons-wrapper-mrv"></div>')),
                video = $(this);

            if (!buttonWrapper.find('[icon-button-for-mrv="' + video.attr('variant-editable-mrv') + '"]').length) {

                editVideoButton = addEditVideoButton(video.attr('variant-editable-mrv'), false);
                buttonWrapper.append(editVideoButton);
                video.closest('.local-video-container').append(buttonWrapper);
            }

        });

        $(document).on('mouseenter', '.variant-page-mrv ul.slides:not(.variant-not-editable-mrv)', function(e) {
            var slider = $(this);
            slider.parent().flexslider("pause");
            slider.addClass("paused");

            // Take active slider class off any other slider to make this the only active slider.
            $('#master-html-mrv .variant-active-slider-mrv').removeClass('variant-active-slider-mrv');

            //Put slider buttons into each slide of the currently hovered slider.
            addSliderButtons(slider.attr('variant-editable-mrv'));

            // This is to get around the slider buttons disappearing on clone/delete of slide and mitigates need to move mouse to make them show up again. 
            // By adding variant-active-slider-mrv to the currently hovered slider, the buttons can be added again automatically when this slider is reinited.
            // This has to be done in master-html because the live version does not persist through the reinit. 
            // This class is automatically removed in output.
            $('#master-html-mrv .' + slider.attr('variant-editable-mrv')).addClass('variant-active-slider-mrv');
        });

        $(document).on('mouseleave', '.variant-page-mrv ul.slides.paused:not(.variant-not-editable-mrv)', function(e) {
            var slider = $(this);
            slider.parent().flexslider("play")
            slider.removeClass('paused');
        });

        $(document).on('mouseleave', '.variant-page-mrv .variant-image-wrapper-mrv, .variant-page-mrv div[class*="col-"], .variant-page-mrv .embed-video-container, .variant-page-mrv .local-video-container, .variant-page-mrv .media-embed-container, .variant-page-mrv ul.slides, .variant-molecule-mrv', function(e) {
            $(this).find('.icon-buttons-wrapper-mrv').remove();
        });

        /**********  END OF HANDLING IMAGE BUTTON AND SLIDE BUTTON ADDITION AND REMOVAL **************/
        /*********************************************************************************************/



        /*********************************************************************************************/
        /*************  HANDLE VARIANT MOLECULES - ADDING IMAGE BUTTONS AND OPTION BUTTONS  **********/

        $(document).on('mouseenter', '.variant-molecule-mrv', function(e) {
            var jMolecule = $(this),
                buttonWrapper, deleteMoleculeButton = "",
                cloneMoleculeButton = "",
                editImageButton = "",
                image;

            buttonWrapper = $('<div class="icon-buttons-wrapper-mrv"></div>');

            // Delete Molecule
            if (jMolecule.parent().find('.variant-molecule-mrv').length > 1) {
                deleteMoleculeButton = createIconButton('minus', 'Delete');
                $(deleteMoleculeButton).unbind('click').bind('click', function(e) {
                    deleteElement(jMolecule.attr('variant-editable-mrv'), true);
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.returnValue = false;
                    return false;
                });
                buttonWrapper.append(deleteMoleculeButton);
            }

            // Find images in this molecule
            moleculeImages = $(this).find('img');
            moleculeImages.each(function() {
                var image = $(this);
                console.log('[icon-button-for-mrv=' + image.attr('variant-editable-mrv') + ']');
                buttonWrapper.append(addEditImageButton(image.attr('variant-editable-mrv'), false));
            });

            elementOptionalAttributes.options.forEach(function(option) {
                if (jMolecule.is(option.selector)) {
                    // Set appendTarget false to receive the button rather than having it appended elsewhere.
                    attributeButton = createAttributeButton(option, false, jMolecule.attr('variant-editable-mrv'));
                    buttonWrapper.append(attributeButton);
                }
            });

            cloneMoleculeButton = createIconButton('plus', 'Clone');
            $(cloneMoleculeButton).unbind('click').bind('click', function(e) {
                cloneElement(jMolecule.attr('variant-editable-mrv'), true);
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.returnValue = false;
                return false;
            });
            buttonWrapper.append(cloneMoleculeButton);

            jMolecule.append(buttonWrapper);

        });

        /**********           END OF HANDLING VARIANT MOLECULE BUTTONS ADDING           **************/
        /*********************************************************************************************/


        // Section controls click events

        $(document).on('click', '.variant-section-control-mrv', function() {
            $(this).toggleClass('variant-active-mrv');
        });

        $(document).on('contextmenu', '.variant-section-control-mrv', function(evt) {
            evt.stopPropagation();
            $(this).trigger('click');
        });



        //
        //    RIGHT-CLICK CONTEXT MENU
        //

        $(document).on('contextmenu', '[variant-editable-mrv]', function(e) {


            // Detect SHIFT and just allow browser to handle it
            if (e.shiftKey) {
                console.log('Right-click cancelled by shift key');
                return true;
            }


            //Show default buttons
            $('.cm-option-mrv').removeClass('variant-hidden-mrv');

            // Hide the optional buttons
            $('.edit-image-button-mrv').text('Edit Image');
            $('.edit-link-button-mrv').text('Edit Link');
            $('.optional-context-button-mrv').addClass('variant-hidden-mrv');


            //item that was right-clicked
            var element = $('#master-html-mrv .' + $(this).attr('variant-editable-mrv')),
                image, link, thumb, navID, closestLink, closestFigure, newMenu, winWidth, winHeight,
                nearestSection = $(element).closest('section');
            htmlTags = {
                "SECTION": "Section",
                "LI": "List Item",
                "H1": "Heading",
                "H2": "Heading",
                "H3": "Heading",
                "H4": "Heading",
                "H5": "Heading",
                "H6": "Heading",
                "P": "Paragraph",
                "SPAN": "Span",
                "UL": "Unordered List",
                "DIV": "Div",
                "IMG": "Image",
                "STRONG": "Strong Text",
                "EM": "Emphasised Text",
                "I": "Icon",
                "A": "Link",
                "INPUT": "Input",
                "BLOCKQUOTE": "Quote",
                "FIGCAPTION": "Caption",
                "TD": "Teble Cell",
                "TH": "Table Heading",
                "FORM": "Form"
            };

            console.log('Right-clicked on: ' + element.attr('variant-editable-mrv'));
            $('.cm-header-mrv').text(htmlTags[element.get(0).tagName]).removeClass('variant-hidden-mrv');

            //Check for custom element attribute option
            if ($(element).data('variant-option-mrv')) {
                prepareCustomOption(element, false, false);
            } //Check for custom attribute option on section
            else if ($(element).closest('[data-variant-option-mrv]').length) {
                prepareCustomOption($(element).closest('[data-variant-option-mrv]'), false, false);
            }
            // Check for a global attribute option that applies to this element
            getOptionalElementAttributes($(this).attr('variant-editable-mrv'));

            // Handle general elements.
            if (element.is('p , span, h1, h2, h3, h4, h5, h6, strong, em, li:not(ul.slides > li), ul, div, blockquote, figcaption')) {
                $('.clone-element-button-mrv').unbind('click').bind('click', function() {
                    cloneElement(element.attr('variant-editable-mrv'))
                });
                $('.delete-element-button-mrv').unbind('click').bind('click', function() {
                    deleteElement(element.attr('variant-editable-mrv'))
                });
            }

            // Handle the special cases not handled above - order is important here as some things are meant to override (unbind then re-bind).
            // STARTING BROADLY< MOVE DOWN THE LIST GETTING MORE SPECIFIC. for example, Image dividers are caught by closest section.background-image
            // If user right clicks on an image in the image divider section (eg. logo in coming soon page) the inline img will be overlooked if 
            // is checked higher in the list.  Therefore, img was moved to the bottom of this stack as it is more specific.

            if (element.is('a')) {
                $('.edit-link-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-link-button-mrv').unbind('click').bind('click', function() {
                    promptEditLink(element.attr('variant-editable-mrv'));
                });
                $('.clone-element-button-mrv').unbind('click').bind('click', function() {
                    cloneElement(element.attr('variant-editable-mrv'))
                });

                // Scheduled for removal - cloning a's in li's should now be handled through variant-closest-mrv="parent"
                //if(element.parent().is('li')){
                //	$('.clone-element-button-mrv').unbind('click').bind('click', function(){cloneElement(element.parent().attr('variant-editable-mrv'))}); 	
                //}
                $('.delete-element-button-mrv').unbind('click').bind('click', function() {
                    deleteElement(element.attr('variant-editable-mrv'))
                });
            }

            // When wrapped in a link
            if (element.closest('a').length) {
                $('.edit-link-button-mrv').removeClass('variant-hidden-mrv');

                if (element.closest('a').hasClass('lightbox-link-mrv')) {
                    $('.cm-header-mrv').text('Lightbox Thumbnail');
                    $('.edit-link-button-mrv').text('Edit Lightbox Link');
                    $('.edit-image-button-mrv').text('Edit Thumbnail Image');
                }

                closestLink = element.closest('a').attr('variant-editable-mrv');
                $('.edit-link-button-mrv').unbind('click').bind('click', function() {
                    promptEditLink(closestLink);
                });
            }



            // Video Divider video
            if (element.closest('section, header').find('.video-wrapper').children('video').length) {
                console.log('Considered: .closest(\'section, header\').find(\'.video-wrapper\').children(\'video\').length');
                if (element.is('.overlay')) {
                    $('.cm-header-mrv').text('Video Background');
                    $('.clone-element-button-mrv').addClass('variant-hidden-mrv');
                    $('.delete-element-button-mrv').addClass('variant-hidden-mrv');
                }
                video = element.closest('section, header').find('.video-wrapper').children('video');

                $('.edit-video-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-video-button-mrv').unbind('click').bind('click', function() {
                    promptEditVideo($(video).attr('variant-editable-mrv'));
                });

                // Attica and Pivot Video Divider poster image
                if (element.closest('section, header').find('.background-image-holder').children('.background-image').length) {
                    $('.edit-image-button-mrv').text('Edit Poster Image');
                    $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                    $('.edit-image-button-mrv').unbind('click').bind('click', function() {

                        promptEditImage(element.closest('section, header').find('.background-image-holder').children('.background-image').attr('variant-editable-mrv'));
                    });
                }

                // Pangaea Video Divider poster image
                if (element.closest('.divider-background').find('.background-image').length) {
                    $('.edit-image-button-mrv').text('Edit Poster Image');
                    $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                    $('.edit-image-button-mrv').unbind('click').bind('click', function() {

                        promptEditImage(element.closest('.divider-background').find('.background-image').attr('variant-editable-mrv'));
                    });
                }
            }

            // Video Slider video
            if (element.closest('.slides li').find('.video-wrapper').children('video').length) {
                console.log('Considered: .closest(\'.slides li\').find(\'.video-wrapper\').children(\'video\').length');
                if (element.is('.overlay')) {
                    $('.cm-header-mrv').text('Video Slide Background');
                    $('.clone-element-button-mrv').addClass('variant-hidden-mrv');
                    $('.delete-element-button-mrv').addClass('variant-hidden-mrv');
                }

                video = element.closest('.slides li').find('.video-wrapper').children('video');

                $('.edit-image-button-mrv').text('Edit Poster Image');
                $('.edit-video-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-video-button-mrv').unbind('click').bind('click', function() {
                    promptEditVideo($(video).attr('variant-editable-mrv'));
                });
            }

            // Inline Video
            if (element.closest('video').length) {
                $('.cm-header-mrv').text('Video');
                $('.clone-element-button-mrv').addClass('variant-hidden-mrv');
                $('.delete-element-button-mrv').addClass('variant-hidden-mrv');

                video = element.closest('video');


                $('.edit-video-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-video-button-mrv').unbind('click').bind('click', function() {
                    promptEditVideo($(video).attr('variant-editable-mrv'));
                });
            }

            // Video Slider poster image
            if (element.closest('.slides li').find('.video-wrapper').children('video').length) {
                console.log('Considered: .closest(\'.slides li\').find(\'.video-wrapper\').children(\'video\').length');
                if (element.closest('.slides li').find('.background-image-holder').children('.background-image').length) {
                    $('.edit-image-button-mrv').text('Edit Poster Image');
                    $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                    $('.edit-image-button-mrv').unbind('click').bind('click', function() {

                        promptEditImage(element.closest('.slides li').find('.background-image-holder').children('.background-image').attr('variant-editable-mrv'));
                    });
                }
            }

            // Increase or decrease width 
            if (element.is('p , div, span, figure, article, img')) {

                // For Foundation
                if (element.closest('[class*="medium-"]').length) {
                    closestElement = element.closest('[class*="medium-"]');
                    if (!closestElement.hasClass('medium-12')) {
                        $('.increase-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.increase-width-button-mrv').unbind('click').bind('click', function() {
                            increaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                    if (!closestElement.hasClass('medium-1')) {
                        $('.decrease-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.decrease-width-button-mrv').unbind('click').bind('click', function() {
                            decreaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                }
                if (element.parent().is('div [class*="medium-"]')) {
                    if (!element.parent().hasClass('medium-1')) {
                        $('.decrease-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.decrease-width-button-mrv').unbind('click').bind('click', function() {
                            decreaseWidth(element.attr('variant-editable-mrv'));
                        });
                    }
                    if (!element.parent().hasClass('medium-12')) {
                        $('.increase-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.increase-width-button-mrv').unbind('click').bind('click', function() {
                            increaseWidth(element.attr('variant-editable-mrv'));
                        });
                    }
                }

                // for Bootstrap
                // Looks for closest col-sm-* only and binds event to that but looks for (col-md-* || col-sm-*)
                // After and binds to that if found.  This means it will use the medium if there is one, but
                // if there is only a col-sm-* it will go for that instead.

                if (element.closest('[class*="col-md-"]').length) {
                    closestElement = element.closest('[class*="col-md-"]');
                    if (!closestElement.hasClass('col-md-12')) {
                        $('.increase-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.increase-width-button-mrv').unbind('click').bind('click', function() {
                            increaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                    if (!closestElement.hasClass('col-md-1')) {
                        $('.decrease-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.decrease-width-button-mrv').unbind('click').bind('click', function() {
                            decreaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                }
                if (element.closest('[class*="col-sm-"]:not([class*="col-md-"])').length) {
                    closestElement = element.closest('[class*="col-sm-"]:not([class*="col-md-"])');
                    if (!closestElement.hasClass('col-sm-12')) {
                        $('.increase-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.increase-width-button-mrv').unbind('click').bind('click', function() {
                            increaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                    if (!closestElement.hasClass('col-sm-1')) {
                        $('.decrease-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.decrease-width-button-mrv').unbind('click').bind('click', function() {
                            decreaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                }
                if (element.closest('[class*="col-xs-"]:not([class*="col-md-"])').length) {
                    closestElement = element.closest('[class*="col-xs-"]:not([class*="col-md-"])');
                    if (!closestElement.hasClass('col-xs-12')) {
                        $('.increase-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.increase-width-button-mrv').unbind('click').bind('click', function() {
                            increaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                    if (!closestElement.hasClass('col-xs-1')) {
                        $('.decrease-width-button-mrv').removeClass('variant-hidden-mrv');
                        $('.decrease-width-button-mrv').unbind('click').bind('click', function() {
                            decreaseWidth(closestElement.attr('variant-editable-mrv'));
                        });
                    }
                }

            }

            /*** REMOVED BECAUSE EACH IMAGE IS NOW HANDLES BY SECTION CONTROLS ***/
            // Header only
            /* 
            if(element.closest('header').find('.background-image').length){
            	
            	image = element.closest('header').find('.background-image');
            	if(image.length){
            		$('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
            		$('.edit-image-button-mrv').unbind('click').bind('click', function(){
            			promptEditImage(image.attr('variant-editable-mrv'));
            		});
            	}
            }
            */


            ///*** REMOVED BECAUSE IMAGES ARE NOW HANDLED BY OWN IMAGE BUTTONS ***///
            // Image Divider
            /*
		if(element.is('.divider-background')){
			$('.cm-header-mrv').text('Image Divider');
			
			image = element.find('.background-image').get(0);	
			if($(image).hasClass('background-image')){
				$('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
				$('.edit-image-button-mrv').unbind('click').bind('click', function(){
					promptEditImage($(image).attr('variant-editable-mrv'));
				});
			}
			$('.clone-element-button-mrv').unbind('click').bind('click', function(){cloneElement(element.attr('variant-editable-mrv'));}); 		
			$('.delete-element-button-mrv').unbind('click').bind('click', function(){deleteElement(element.attr('variant-editable-mrv'));}); 		
		}
        
				
		// Image Divider
		if(element.parent().is('.divider-background')){
			$('.cm-header-mrv').text('Image Divider');
			
			if(element.is('.overlay')){
				$('.clone-element-button-mrv').addClass('variant-hidden-mrv');
				$('.delete-element-button-mrv').addClass('variant-hidden-mrv');
			}
			
			image = element.parent().find('.background-image').get(0);
			if($(image).hasClass('background-image')){
				$('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
				$('.edit-image-button-mrv').unbind('click').bind('click', function(){
					promptEditImage($(image).attr('variant-editable-mrv'));
				});
			}
		}
		*/

            // Work Item
            if (element.is('.cover-wrapper, .hover-state')) {

                image = element.closest('figure').find('img').get(0);
                link = element.closest('a').first();

                if ($(image).is('img')) {
                    $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                    $('.edit-image-button-mrv').unbind('click').bind('click', function() {
                        promptEditImage($(image).attr('variant-editable-mrv'));
                    });
                }

                if (element.closest('figure').length) {
                    closestFigure = element.closest('figure').attr('variant-editable-mrv');
                    if (closestFigure.length) {
                        $('.clone-element-button-mrv').unbind('click').bind('click', function() {
                            cloneElement(closestFigure);
                        });
                        $('.delete-element-button-mrv').unbind('click').bind('click', function() {
                            deleteElement(closestFigure);
                        });
                    }
                }
            }

            // Nav class change buttons
            if ((element.parents('nav').length) || element.is('nav')) {

                if (element.is('nav')) {
                    navID = element.attr('nav-id');
                    $('.cm-header-mrv').text('Nav');
                    $('.cm-option-mrv').addClass('variant-hidden-mrv');
                } else {
                    navID = element.closest('nav').attr('nav-id');
                    $('.cm-header-mrv').text('Nav > ' + $('.cm-header-mrv').text());
                }

                $('.nav-class-context-options-mrv').removeClass('variant-hidden-mrv');

                $('.nav-class-option-button-mrv[nav-id=' + navID + ']').each(function() {
                    if (!$('.variant-page-mrv nav').hasClass($(this).attr('nav-class'))) {
                        $(this).removeClass('variant-hidden-mrv');
                    }
                });

                if (!$('.variant-context-menu-mrv .cm-option-mrv').not('.variant-hidden-mrv').length) {
                    $('.nav-class-context-options-mrv .no-menu-options-mrv').removeClass('variant-hidden-mrv');
                }

            }

            // Multi-layer parallax
            if (element.closest('.hover-background').length) {
                console.log('Considered: .is(\'.hover-background\')');
                image = element.closest('section').find('.hover-background .background-image').get(0);

                if ($(image).is('img')) {
                    $('.edit-image-button-mrv').text('Edit Background Image').removeClass('variant-hidden-mrv');
                    $('.edit-image-button-mrv').unbind('click').bind('click', function() {
                        promptEditImage($(image).attr('variant-editable-mrv'));
                    });
                }

                $(element).closest('.hover-background').find('.foreground-image-holder .background-image').each(function(index) {
                    var foregroundNumber = index + 1,
                        image = $(this);

                    console.log('Found foreground: ' + $(this).attr('variant-editable-mrv'));
                    newButton = $('.edit-image-button-mrv').clone();
                    newButton.removeClass('edit-image-button-mrv').addClass('edit-foreground-button-mrv edit-foreground-' + foregroundNumber);
                    newButton.text('Edit Layer ' + foregroundNumber + ' Image');
                    $(this).attr('src');
                    newButton.unbind('click').bind('click', function() {
                        promptEditImage(image.attr('variant-editable-mrv'));
                    });
                    newButton.insertBefore($('.edit-image-button-mrv'));
                });

            }

            // Choose Icon
            if (element.is('i')) {
                $('.cm-header-mrv').text('Icon');

                $('.edit-icon-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-icon-button-mrv').unbind('click').bind('click', function() {
                    promptEditIcon(element.attr('variant-editable-mrv'));
                });

                $('.clone-element-button-mrv').unbind('click').bind('click', function() {
                    cloneElement(element.attr('variant-editable-mrv'));
                });
                $('.delete-element-button-mrv').unbind('click').bind('click', function() {
                    deleteElement(element.attr('variant-editable-mrv'));
                });
            }

            if (element.is('img')) {
                $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-image-button-mrv').unbind('click').bind('click', function() {
                    promptEditImage(element.attr('variant-editable-mrv'));
                });
                $('.clone-element-button-mrv').unbind('click').bind('click', function() {
                    cloneElement(element.attr('variant-editable-mrv'))
                });
                $('.delete-element-button-mrv').unbind('click').bind('click', function() {
                    deleteElement(element.attr('variant-editable-mrv'))
                });
            }

            if (element.is('section')) {
                $('.cm-header-mrv').text('Section');
                $('.clone-element-button-mrv').unbind('click').addClass('variant-hidden-mrv');
                $('.delete-element-button-mrv').unbind('click').addClass('variant-hidden-mrv');
            }

            if (element.is('header')) {
                $('.cm-header-mrv').text('Section');
                $('.clone-element-button-mrv').unbind('click').addClass('variant-hidden-mrv');
                $('.delete-element-button-mrv').unbind('click').addClass('variant-hidden-mrv');
            }


            // Lightbox images/divs just clone closest .lightbox-thumbnail-mrv
            if (element.closest('.lightbox-thumbnail-mrv').length) {

                thumb = $(element).closest('.lightbox-thumbnail-mrv');
                image = $(element).closest('.lightbox-thumbnail-mrv').find('img');

                $('.edit-image-button-mrv').removeClass('variant-hidden-mrv');
                $('.edit-image-button-mrv').unbind('click').bind('click', function() {
                    promptEditImage(image.attr('variant-editable-mrv'));
                });

                $('.clone-element-button-mrv').removeClass('variant-hidden-mrv').unbind('click').bind('click', function() {
                    cloneElement(thumb.attr('variant-editable-mrv'))
                });
                $('.delete-element-button-mrv').removeClass('variant-hidden-mrv').unbind('click').bind('click', function() {
                    deleteElement(thumb.attr('variant-editable-mrv'))
                });


            }

            if (element.hasClass('variant-disable-clone-mrv')) {
                $('.clone-element-button-mrv').unbind('click').addClass('variant-hidden-mrv');
            }

            // This is for the right click menu so we do want it to be shown straight away - hence "true" as second argument show
            // Others such as section controls have their own show/hide mechanisms so they pass false or nothing at all.
            getOptionalElementClasses($(this).attr('variant-editable-mrv'), true);

            newMenu = $('body > .variant-context-menu-mrv');
            if (newMenu.find('.cm-option-mrv:not(.variant-hidden-mrv)').length) {

                winWidth = $(window).width();
                winHeight = $(window).height();

                // Menu not off screen to right
                if ((e.pageX + newMenu.outerWidth()) > winWidth)
                    newMenu.css("left", winWidth - newMenu.outerWidth());
                else
                    newMenu.css("left", e.pageX);

                // Menu not off screen at bottom
                if ((e.pageY + newMenu.outerHeight()) > winHeight)
                    newMenu.css("top", winHeight - newMenu.outerHeight());
                else
                    newMenu.css("top", e.pageY);

                initSizes();
                newMenu.show();
            } else {
                newMenu.hide();
            }
            return false;
        });

        $(document).on('click', '.edit-foreground-button-mrv', function() {
            $('.edit-foreground-button-mrv').remove();
        });

        $(document).on('click', '.variant-show-deleted-mrv', function() {

            $(this).removeClass('variant-show-deleted-mrv variant-deleted-mrv').addClass('variant-undeleted-mrv');
            $('#master-html-mrv .' + $(this).attr('variant-editable-mrv')).removeClass('variant-show-deleted-mrv variant-deleted-mrv').addClass('variant-undeleted-mrv');

            // HANDLE THE ALSO ELEMENT IF PRESENT - FOR EXAMPLE RESTORING THE SIDEBAR MENU WHEN RESTORING THE SIDEBAR TOGGLE
            if ($(this).attr('variant-also-mrv')) {

                also = $(this).closest('nav, header, section, footer').find($(this).attr('variant-also-mrv')).attr('variant-editable-mrv');

                console.log('Also restoring this element: ' + also);

                $('.variant-page-mrv .' + also).removeClass('variant-show-deleted-mrv variant-deleted-mrv').addClass('variant-undeleted-mrv');
                $('#master-html-mrv .' + also).removeClass('variant-show-deleted-mrv variant-deleted-mrv').addClass('variant-undeleted-mrv');
            }


            updateCustomNavs();
            updateCustomFooters();
            saveState();
        });

        $(document).on('click', '.edit-image-gallery-image-mrv', function() {
            var image = $(this).get(0);
            $('.edit-image-src-mrv').val($(this).attr('src').replace('../img/', 'img/'));
            $('.editing-image-preview-mrv').attr('src', $(this).attr('src'));
            $('.image-res-mrv').text(image.naturalWidth + 'x' + image.naturalHeight + ' pixels');
            $('.image-edit-chooser-mrv,.edit-image-modal-mrv').toggleClass('variant-active-mrv');
        });

        $(document).on('click', '.section-thumb-mrv', function() {
            var element = $(this);
            if (!element.hasClass('catch-double-click')) {
                element.addClass('catch-double-click');
                setTimeout(function() {
                    element.removeClass('catch-double-click')
                }, 300);
                appendSection($(this).attr('sidebar-section-id-mrv'));
            } else {
                $('.add-section-modal-mrv').toggleClass('variant-active-mrv');
            }

            $('.layout-map-mrv').removeClass('empty-layout-map-mrv');

            initSizes();
        });

        $(document).on('click', '.no-image', function() {
            refreshLostImage(this);
        });

        $(document).on('click', '.cm-option-active-mrv', function() {
            $('.variant-context-menu-mrv').hide();
        });

        $(document).on('keyup paste input', '.edit-icon-modal-mrv .edit-icon-filter-mrv', function() {
            var filter = $('.edit-icon-modal-mrv .edit-icon-filter-mrv').val();
            if (filter !== "") {
                filterIcons(filter);
                $('.edit-icon-modal-mrv .edit-icon-clear-filter-mrv').removeClass('variant-hidden-mrv');
            } else {
                clearIconsFilter();
            }
        });

        $(document).on('click', '.variant-icon-tabs-mrv li:not(.variant-active-mrv)', function() {
            var thisTab = $(this);
            $('.variant-icon-tabs-mrv li.variant-active-mrv, .variant-icon-sets-mrv li.variant-active-mrv').removeClass('variant-active-mrv');
            thisTab.addClass('variant-active-mrv');
            $('.variant-icon-sets-mrv li.icon-pack-list-info-mrv').eq(thisTab.index()).addClass('variant-active-mrv');
            $('.variant-icon-sets-mrv li.icon-pack-list-mrv').eq(thisTab.index()).addClass('variant-active-mrv');
        });

        $(document).on('click', '.edit-icon-modal-mrv .edit-icon-clear-filter-mrv', function() {
            clearIconsFilter();
        });

        $(document).on('click', '.variant-page-mrv i', function() {
            var element = $(this);
            if (!element.hasClass('catch-double-click')) {
                element.addClass('catch-double-click');
                setTimeout(function() {
                    element.removeClass('catch-double-click')
                }, 300);
            } else {
                promptEditIcon(element.attr('variant-editable-mrv'));
            }
        });

        $(document).on('click', 'div.choosable-icon-mrv', function() {
            var icon = $('.' + $('#select-icon-id-mrv').val()),
                clickedIcon = $(this).find('i');


            //Store the size specific icon classes that may share an icon prefix such as icon-
            if (icon.hasClass('icon-large')) {
                icon.addClass('keep-large-icon').removeClass('icon-large');
            }
            if (icon.hasClass('icon-lg')) {
                icon.addClass('keep-lg-icon').removeClass('icon-lg');
            }
            if (icon.hasClass('icon-sm')) {
                icon.addClass('keep-sm-icon').removeClass('icon-sm');
            }

            // Remove icons of either prefix using the comma separated list in the body tags
            iconPacks.forEach(function(pack) {
                icon.alterClass(pack.iconPrefix + '*', '');
                icon.removeClass(pack.iconClass);
            });
            icon.addClass(clickedIcon.attr('icon-class'));


            // Put back the icon size specific classes
            if (icon.hasClass('keep-large-icon')) {
                icon.removeClass('keep-large-icon').addClass('icon-large');
            }

            if (icon.hasClass('keep-lg-icon')) {
                icon.removeClass('keep-lg-icon').addClass('icon-lg');
            }

            if (icon.hasClass('keep-sm-icon')) {
                icon.removeClass('keep-sm-icon').addClass('icon-sm');
            }

            updateIconCounts();
            saveState();
        });

        $(document).on('click', '.delete-page-button-mrv', function() {
            var stateID = $(this).parent().attr('state-id'),
                io;
            if (stateID == $.localStorage(templateNameSpace + '.state.last-state-id-mrv')) {
                $('.load-previous-page-mrv').addClass('variant-hidden-mrv');
                $.localStorage(templateNameSpace + '.state.last-state-id-mrv', '');
                $.localStorage(templateNameSpace + '.state.last-name-mrv', '');
            }
            $('#state-bank-mrv [variant-saved-state-mrv=' + stateID + ']').remove();
            $.localStorage(templateNameSpace + '.state.state-bank-mrv', $('#state-bank-mrv').html());

            setTimeout(function() {
                if ($('.saved-pages-holder-mrv').find('.load-page-button-mrv').length) {
                    $('.saved-pages-holder-mrv').removeClass('empty-saved-pages-holder-mrv');
                } else {
                    $('.saved-pages-holder-mrv').addClass('empty-saved-pages-holder-mrv');
                }
            }, 50);


            io = $.localStorage.io(templateNameSpace + '.state.master-html-mrv.' + stateID);
            io.remove();
            io = $.localStorage.io(templateNameSpace + '.state.layout-map-mrv.' + stateID);
            io.remove();
            $(this).parent().remove();
            return false;
        });

        $(document).on('click', '.variant-colour-scheme-mrv', function() {
            switchColourScheme($(this).attr('variant-scheme-css-mrv'), true);

        });

        $(document).on('click', '.variant-font-set-mrv', function() {
            switchFont($(this).attr('variant-font-set-name-mrv'), true);
        });

        // Click Body Class Option Buttons
        $(document).on('click', '.class-choice-button-mrv', function() {
            if (!$(this).hasClass('choice-active-mrv')) {

                var optionalClass = $(this).parent().attr('optionalclass'),
                    classTarget = $(this).parent().attr('classtarget');
                $(this).parent().find('.class-choice-button-mrv').toggleClass('choice-active-mrv');
                if ($(this).hasClass('choice-button-on')) {
                    $(classTarget).addClass(optionalClass);
                } else {
                    $(classTarget).removeClass(optionalClass);
                }
            }

            $(classTarget).each(function() {
                if ($(this).attr('class') == "") {
                    $(this).removeAttr('class');
                }
            });

            if ($(this).hasClass('refresh')) {
                refresh();
            }

            saveState();
        });

        $(document).on('click', '.class-toggle-switch-mrv', function(evt) {
            var optionalClass = $(this).parent().attr('optionalClass'),
                classTarget = $(this).parent().attr('classtarget');

            // Stop the click bubbling up the tree.
            evt.stopPropagation();

            if ($(this).hasClass('toggle-active-mrv')) {
                $(classTarget).removeClass(optionalClass);
            } else {
                $(classTarget).addClass(optionalClass);
            }

            $(this).toggleClass('toggle-active-mrv');

            $(classTarget).each(function() {
                if ($(this).attr('class') == "") {
                    $(this).removeAttr('class');
                }
            });

            if ($(this).hasClass('refresh')) {
                refresh();
            }

            if (optionalClass == 'parallax') {
                initParallax();
                if (window.mr_parallax != undefined) {
                    window.mr_parallax.callback(classTarget);
                }

            }

            saveState();
        });

        $(document).on('click', '.class-multi-button-mrv', function() {
            if (!$(this).hasClass('choice-active-mrv')) {
                var optionalClass = $(this).attr('optionalclass'),
                    classTarget = $(this).parent().attr('classtarget');
                removeClass = $(this).parent().find('.class-multi-button-mrv.multi-active-mrv').attr('optionalclass');

                $(this).parent().find('.class-multi-button-mrv').removeClass('multi-active-mrv');
                $(this).addClass('multi-active-mrv');
                $(classTarget).removeClass(removeClass).addClass(optionalClass);
            }

            $(classTarget).each(function() {
                if ($(this).attr('class') == "") {
                    $(this).removeAttr('class');
                }
            });

            saveState();

            if ($(this).hasClass('refresh')) {
                refresh();
            }
        });

        $(document).on('click', '.variant-attribute-option-button-mrv', function() {
            // prepareCustomOption(attribute target element selector, global options object, true to promptNow instead of showing buttons );
            prepareCustomOption('.' + $(this).attr('attribute-option-target-mrv'), $(this).data('variant-attribute-option-mrv'), true);
        });
    });

    $(window).load(function() {

        // Detect IE

        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE "),
            userIE = 0;

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { // If Internet Explorer, return version number
            $('#if-ie').removeClass('variant-hidden-mrv');
            userIE = 1;
        }


        if (userIE == 0) {
            setTimeout(function() {
                $('.splash-screen-mrv').addClass('content-hidden-mrv');
                $('.variant-container-mrv').removeClass('content-hidden-mrv');
                setTimeout(function() {
                    $('.splash-screen-mrv').remove();
                    startup();
                    initSizes();
                }, 300);
            }, 100);
        }

        // All images that had their src attribute changed to delay-src by grunt will be changed back on window load.
        $('[delay-src]').each(function(index, image) {
            $(this).attr('src', $(this).attr('delay-src')).removeAttr('delay-src');
        });

        // Append the font icon packs css strings to head
        iconPacks.forEach(function(pack) {
            var headString = pack.headString;
            headString = headString.replace('href=&quot;css/', 'href="theme/css/').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            $('head').prepend(headString);
        });

        checkForDemoLoad();

    });

    function initTargets() {

        $('.variant-page-mrv').html($('#master-html-mrv').html());
        defaultMasterTarget = $('#master-html-mrv');
        defaultPageTarget = $('.variant-page-mrv');
        templateNameSpace = $('body').attr('mrv_namespace') !== 'undefined' ? $('body').attr('mrv_namespace') : 'mrv_variant.default';
        mrv_masterContentTarget = $('body').attr('mrv_contentTarget') ? $('#master-html-mrv ' + $('body').attr('mrv_contentTarget')) : defaultMasterTarget;
        mrv_pageContentTarget = $('body').attr('mrv_contentTarget') ? $('.variant-page-mrv ' + $('body').attr('mrv_contentTarget')) : defaultPageTarget;
        mrv_masterNavTarget = $('body').attr('mrv_navTarget') ? $('#master-html-mrv ' + $('body').attr('mrv_navTarget')) : mrv_masterContentTarget;
        mrv_pageNavTarget = $('body').attr('mrv_navTarget') ? $('.variant-page-mrv ' + $('body').attr('mrv_navTarget')) : mrv_pageContentTarget;
        mrv_masterFooterTarget = $('body').attr('mrv_footerTarget') ? $('#master-html-mrv ' + $('body').attr('mrv_footerTarget')) : mrv_masterContentTarget;
        mrv_pageFooterTarget = $('body').attr('mrv_footerTarget') ? $('.variant-page-mrv ' + $('body').attr('mrv_footerTarget')) : mrv_pageContentTarget;

    }

    function initSizes() {

        var layoutMapHeight;

        $('.variant-container-mrv').css('height', $(window).height());

        layoutMapHeight = ($('.sidebar-content-mrv').height() - $('.sidebar-content-mrv .sidebar-section-title-mrv').height() - $('.sidebar-content-mrv .sidebar-foot-mrv').height() - $('.sidebar-content-mrv .sidebar-input-mrv').height() - (2 * $('.sidebar-content-mrv .style-switcher-mrv').height())) - $('.add-section-button-mrv').height() - 64;

        $('.layout-map-mrv').css('max-height', layoutMapHeight);

        var sectionThumbsHeight = ($(window).height() - $('.layout-map-mrv').outerHeight(false) - $('.sidebar-content-mrv .sidebar-foot-mrv').height() - $('.filters-holder-mrv').height() - 9);
        $('.section-thumbs-container-mrv').css('height', sectionThumbsHeight);

        var savedPagesHeight = ($(window).height() - $('.sidebar-pages-mrv .sidebar-foot-mrv').height() - $('.sidebar-pages-mrv .sidebar-section-title-mrv').height() - $('.save-page-as-button-mrv').height()) - 32;
        $('.saved-pages-holder-mrv').css('max-height', savedPagesHeight);

        makeModalsDraggable();

    }

    function appendSection(sectionID) {
        var section = $('#' + sectionID).find('section, header, footer').clone(),
            time = makeEditable($(section)),
            contentFooter, layoutMap, variantPage;

        if (mrv_masterFooterTarget.selector != mrv_masterContentTarget.selector) {
            $(section).addClass(sectionID + '-' + time).appendTo(mrv_masterContentTarget);
        } else {
            contentFooter = $(mrv_masterContentTarget).find('footer');
            if (contentFooter.length) {
                $(section).addClass(sectionID + '-' + time).insertBefore(contentFooter);
            } else {
                $(section).addClass(sectionID + '-' + time).appendTo(mrv_masterContentTarget);
            }
        }


        $('.layout-map-mrv').append('<div class="added-section-mrv data-original-section-id-mrv="' + sectionID + '" data-section-id-mrv="' + sectionID + '-' + time + '"><div class="added-section-name-mrv"><span class="variant-original-mrv" contenteditable="true">' + $('#' + sectionID).attr('data-section-name-mrv') + '</span></div><i class="delete-section-button-mrv variant-icon variant-close-circle" data-section-id-mrv="' + sectionID + '-' + time + '"></i></div>');
        makeLayoutMapSortable();

        saveState();
        refresh();
        initSizes();

        layoutMap = $('.layout-map-mrv');
        layoutMapHeight = layoutMap[0].scrollHeight
        layoutMap.animate({
            scrollTop: layoutMapHeight
        }, 480);

    }

    function switchNav(navID, origin) {

        $('#master-html-mrv nav, .variant-page-mrv nav').remove();

        if (origin == 'variant-original-mrv') {

            var navContent = $('#' + navID).clone();

            $(navContent).find('script.options').remove();
            mrv_masterNavTarget.prepend(navContent.html());
            mrv_masterNavTarget.find('nav').addClass('variant-original-mrv').attr('nav-id', navID);
            makeEditable(mrv_masterNavTarget.find('nav'));
            loadOptionalNavClasses(navID);

        }
        if (origin == 'variant-custom-mrv') {
            navContent = getHTML($('#custom-nav-bank-mrv [variant-custom-nav-mrv=' + navID + ']').get(0), true);
            mrv_masterNavTarget.prepend(navContent);
            loadOptionalNavClasses($('#custom-nav-bank-mrv [variant-custom-nav-mrv=' + navID + ']').attr('nav-id'));
        }
        saveState();
        refresh();
    }

    function switchFooter(footID, origin) {

        $('#master-html-mrv footer').remove();

        if (origin == 'variant-original-mrv') {
            var footContent = $('#' + footID).html();
            mrv_masterFooterTarget.append(footContent);
            mrv_masterFooterTarget.find('footer').addClass('variant-original-mrv');
            makeEditable(mrv_masterFooterTarget.find('footer'));
        }
        if (origin == 'variant-custom-mrv') {
            footContent = getHTML($('#custom-footer-bank-mrv [variant-custom-footer-mrv=' + footID + ']').get(0), true);
            mrv_masterFooterTarget.append(footContent);
        }
        saveState();
        refresh();

    }

    function updateOrder() {
        var pageContentTarget = $(mrv_pageContentTarget.selector),
            masterContentTarget = $(mrv_masterContentTarget.selector),
            pageHasFooter = pageContentTarget.find('footer'),
            htmlHasFooter = masterContentTarget.find('footer');

        $('.layout-map-mrv .added-section-mrv').each(function() {

            var sectionID = $(this).attr('data-section-id-mrv'),
                originalSection = masterContentTarget.find('.' + sectionID),
                clonedSection = originalSection.clone(),
                originalLink = masterContentTarget.find('[variant-inner-links-to-mrv=' + sectionID + ']'),
                clonedLink = originalLink.clone();

            originalLink.remove();
            if (htmlHasFooter.length) {
                clonedLink.insertBefore(htmlHasFooter);
            } else {
                clonedLink.appendTo(masterContentTarget);
            }

            originalSection.remove();
            if (htmlHasFooter.length) {
                clonedSection.insertBefore(htmlHasFooter);
            } else {
                clonedSection.appendTo(masterContentTarget);
            }

            originalSection = pageContentTarget.find('.' + sectionID);
            clonedSection = originalSection.clone();
            originalLink = pageContentTarget.find('[variant-inner-links-to-mrv=' + sectionID + ']');
            clonedLink = originalLink.clone();

            originalLink.remove();
            if (pageHasFooter.length) {
                clonedLink.insertBefore(pageHasFooter);
            } else {
                clonedLink.appendTo(pageContentTarget);
            }

            originalSection.remove();
            if (pageHasFooter.length) {
                clonedSection.insertBefore(pageHasFooter);
            } else {
                clonedSection.appendTo(pageContentTarget);
            }
        });
        saveState();
        refresh();
    }

    function makeEditable(section) {
        var time = new Date().getTime(),
            uniqueClass = 'variant-editable-' + time;

        if ($(section).is('section, nav, header, footer, .divider-background')) {
            $(section).attr('variant-editable-mrv', uniqueClass);
            $(section).addClass(uniqueClass);
        }

        $(section).find('p, span, a, h1, h2, h3, h4, h5, h6, strong, em, ul, li, div, i, img, section, header, figure, video, iframe, input, textarea, blockquote, figcaption, tbody, tr, td, th, form').not('.variant-ignore-mrv').each(function(index) {
            var uniqueClassIndexed = uniqueClass + '-' + index;
            $(this).attr('variant-editable-mrv', uniqueClassIndexed);
            $(this).addClass(uniqueClassIndexed);
            if (!$(this).is('nav, nav li, .slides > li, ul, div, i, img, section, header, figure, video, iframe, input, textarea, form, tbody, tr, td, .variant-not-editable-mrv')) {
                $(this).addClass('variant-original-mrv');
                $(this).attr('contenteditable', 'true');
            }
            // The elements below are allowed in contenteditable elements, so don't remove contenteditable from the parent.
            if (!$(this).is('a, strong, em, i')) {
                $(this).parent().removeAttr('contenteditable');
            }

        });

        return time;
    }

    function refresh() {
        $('.variant-page-mrv').html($('#master-html-mrv').html());
        $('.variant-page-mrv').find('[no-src]').each(function() {
            $(this).attr('src', $(this).attr('no-src')).removeAttr('no-src');
        });

        setTimeout(function() {
            console.log('Refreshing...');
            reInit('.variant-page-mrv');
            disableLinks();
            makeSortable();
            $('.variant-page-mrv .embedded-video-holder').each(function() {
                $(this).addClass('variant-embedded-video-mrv');
            });

            initParallax();

            // When the user clones or deletes a slide, we use this to make sure they still have buttons
            // on the slides without needing to move the mouse around and make them appear.
            $('.variant-page-mrv .variant-active-slider-mrv').trigger('mouseenter');

        }, 100);

    }

    function htmlEntities(str) {

        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /*Open Settings Modal */

    function openSettingsModal() {
        $('.global-options-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    /*  Nav Saving Functions */
    function promptSaveNav(customNav) {
        $('.name-nav-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                $('.save-nav-button-mrv').val('');
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    // Saves a nav after prompting to do so when a new nav is edited for the first time
    function saveNav() {
        var time = new Date().getTime(),
            navID = 'variant-custom-nav-mrv-' + time,
            navName = $('.save-nav-name-mrv').val(),
            customNavs;
        $('.nav-options-list-mrv').closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(navName);
        $('.save-nav-name-mrv').val('');
        $('#master-html-mrv nav').removeClass('variant-original-mrv').addClass('variant-custom-mrv').addClass(navID).attr('variant-custom-nav-mrv', navID).attr('variant-nav-name-mrv', navName);
        $('.variant-page-mrv nav').removeClass('variant-original-mrv').addClass('variant-custom-mrv').addClass(navID).attr('variant-custom-nav-mrv', navID).attr('variant-nav-name-mrv', navName);
        $('#custom-nav-bank-mrv').append($('#master-html-mrv nav').clone());
        customNavs = $('#custom-nav-bank-mrv').html();
        $.localStorage(templateNameSpace + '.custom-navs-mrv', customNavs);
        addNavToList($('.' + navID));
    }


    function addNavToList(nav) {

        $('.nav-options-list-mrv').append('<li class="nav-option-mrv" nav-id="' + $(nav).attr('variant-custom-nav-mrv') + '" variant-origin-mrv="variant-custom-mrv">' + $(nav).attr('variant-nav-name-mrv') + '<span class="delete-nav-button-mrv oi" data-glyph="x"></span></li>');

    }

    function loadCustomNavs() {

        $('#custom-nav-bank-mrv').append($.localStorage(templateNameSpace + '.custom-navs-mrv'));
        $('#custom-nav-bank-mrv nav').each(function() {
            addNavToList($(this));
        });
    }

    function updateCustomNavs() {
        var currentNav = $('.variant-page-mrv nav'),
            navID = currentNav.attr('variant-custom-nav-mrv');
        $('#master-html-mrv .' + navID).html(currentNav.html()).attr('class', currentNav.attr('class'));
        $('#custom-nav-bank-mrv .' + navID).html(currentNav.html()).attr('class', currentNav.attr('class'));
        $('#custom-nav-bank-mrv .variant-show-deleted-mrv').removeClass('variant-show-deleted-mrv');
        $.localStorage(templateNameSpace + '.custom-navs-mrv', $('#custom-nav-bank-mrv').html());
    }

    function updateCustomFooters() {
        var currentFooter = $('.variant-page-mrv footer'),
            footerID = currentFooter.attr('variant-custom-footer-mrv');
        $('#master-html-mrv .' + footerID).html(currentFooter.html());
        $('#custom-footer-bank-mrv .' + footerID).html(currentFooter.html());
        $('#custom-footer-bank-mrv .variant-show-deleted-mrv').removeClass('variant-show-deleted-mrv');
        $.localStorage(templateNameSpace + '.custom-footers-mrv', $('#custom-footer-bank-mrv').html());
    }

    /* Footer Saving Functions */
    function promptSaveFooter(customNav) {
        $('.name-footer-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                $('.save-footer-button-mrv').val('');
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    function saveFooter() {
        var time = new Date().getTime(),
            footID = 'variant-custom-footer-mrv-' + time,
            footName = $('.save-footer-name-mrv').val(),
            customfooters;
        $('.footer-options-list-mrv').closest('.style-switcher-mrv').find('.style-switcher-title-mrv').text(footName);
        $('.save-footer-name-mrv').val('');
        $('#master-html-mrv footer').removeClass('variant-original-mrv').addClass('variant-custom-mrv').addClass(footID).attr('variant-custom-footer-mrv', footID).attr('variant-footer-name', footName);
        $('.variant-page-mrv footer').removeClass('variant-original-mrv').addClass('variant-custom-mrv').addClass(footID).attr('variant-custom-footer-mrv', footID).attr('variant-footer-name', footName);
        $('#custom-footer-bank-mrv').append($('#master-html-mrv footer').clone());
        customfooters = $('#custom-footer-bank-mrv').html();
        $.localStorage(templateNameSpace + '.custom-footers-mrv', customfooters);
        addFooterToList($('.' + footID));
    }

    function addFooterToList(footer) {
        $('.footer-options-list-mrv').append('<li class="footer-option-mrv" variant-footer-id-mrv="' + $(footer).attr('variant-custom-footer-mrv') + '" footer-value-mrv="' + $(footer).attr('variant-custom-footer-mrv') + '" variant-origin-mrv="variant-custom-mrv">' + $(footer).attr('variant-footer-name') + '<span class="delete-footer-button-mrv oi" data-glyph="x"></span></li>');
    }

    function loadCustomFooters() {

        $('#custom-footer-bank-mrv').append($.localStorage(templateNameSpace + '.custom-footers-mrv'));
        $('#custom-footer-bank-mrv footer').each(function() {
            addFooterToList($(this));
        });
    }

    function promptSection() {
        $('.sidebar-modal-mrv').removeClass('show-sidebar-modal-mrv');
        $('.add-section-modal-mrv').toggleClass('show-sidebar-modal-mrv');
    }

    /* Link Editing functions */
    function promptEditLink(link) {
        $('.edit-link-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                // Reset the modal text and hide the in-page link options
                $('.select-inner-link-mrv').addClass('variant-hidden-mrv');
                var targetLink = $('.' + link);
                if (targetLink.hasClass('lightbox-link-mrv')) {
                    $('.editing-link-text-mrv').text('for Lightbox Image');
                } else {
                    populateInpageLinkOptions();
                }
                $('.edit-link-href-mrv').val($('.' + link).attr('href').replace('../img/', 'img/'));
                $('.edit-link-id-mrv').val(link);
                $('.edit-link-target-option-mrv').removeAttr('selected');
                if (typeof $('.' + link).attr('target') !== "undefined") {
                    $('.edit-link-target-' + $('.' + link).attr('target') + '-mrv').attr('selected', 'selected');
                } else {
                    $('.edit-link-target-option-mrv[value="_self"]').attr('selected', 'selected');
                }
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    /* Link Editing functions */
    function promptEditImage(image) {
        $('.edit-image-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                console.groupCollapsed('Gallery ALERT');
                console.error('filling image chooser gallery with data form gallery-bank-mrv html: ' + $('#gallery-bank-mrv').html());
                console.groupEnd();
                $('.image-chooser-gallery-mrv').html($('#gallery-bank-mrv').html());
                $('.editing-image-preview-mrv').attr('src', $('.' + image).attr('src'));
                $('.edit-image-preview-mrv .image-res-mrv').text($('.' + image).get(0).naturalWidth + 'x' + $('.' + image).get(0).naturalHeight + ' pixels');
                $('.edit-image-src-mrv').val($('.' + image).attr('src').replace('../img/', 'img/'));
                $('.edit-image-id-mrv').val(image);
                $('.edit-image-alt-mrv').val($('.' + image).attr('alt'));
                $('.image-chooser-gallery-mrv .image-chooser-thumbnail-mrv').each(function(image) {
                    var image = $(this).find('img').get(0),
                        resolutionSpan = $(this).find('.image-thumbnail-res-mrv');
                    resolutionSpan.text(image.naturalWidth + 'x' + image.naturalHeight);
                });
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    saveGallery();
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    /* Icon Chooser modal */
    function promptEditIcon(icon) {
        $('.edit-icon-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            minHeight: 620,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                $('#select-icon-id-mrv').val(icon);
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                updateIconCounts();
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    function promptEditVideo(video) {
        $('.edit-video-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                $('.edit-video-id-mrv').val(video);
                $('.edit-mp4-src-mrv').val($('.' + video + ' > source[type="video/mp4"]').attr('src').replace('../video/', 'video/'));
                $('.edit-webm-src-mrv').val($('.' + video + ' > source[type="video/webm"]').attr('src').replace('../video/', 'video/'));
                $('.edit-ogv-src-mrv').val($('.' + video + ' > source[type="video/ogg"]').attr('src').replace('../video/', 'video/'));
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    function promptSaveState() {
        $('.save-page-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                $('.save-page-name-mrv').val('');
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    function variantAlert(titleText, bodyText) {

        titleText = typeof titleText !== 'undefined' ? titleText : "";
        bodyText = typeof bodyText !== 'undefined' ? bodyText : "";

        $('.alert-title-mrv').text(titleText);
        $('.alert-body-mrv').html(bodyText);
        $('.alert-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    // element: a jquery reference to the elememt, globalOption: makes this function use the options from global options
    function prepareCustomOption(element, globalOption, promptNow) {
        var optionArray = globalOption || element.data('variant-option-mrv'),
            elementWithOption, currentValue, icon, refresh;


        if ($(element).find(optionArray.selector + "[" + optionArray.attribute + "]").length) {
            elementWithOption = $('#master-html-mrv ' + $(element).attr('variant-editable-mrv')).find(optionArray.selector + "[" + optionArray.attribute + "]");
        } else {
            elementWithOption = $('#master-html-mrv .' + $(element).attr('variant-editable-mrv'));
        }

        icon = typeof optionArray.modalInputIcon !== "undefined" ? optionArray.modalInputIcon : 'pencil';
        refresh = typeof optionArray.refresh !== "undefined" ? "true" : "false";

        currentValue = elementWithOption.attr(optionArray.attribute);

        $('.custom-detail-title-mrv').text(optionArray.modalTitle);
        $('.custom-detail-intro-mrv').text(optionArray.modalIntro);
        $('.custom-detail-input-label-mrv').text(optionArray.modalInputLabel);
        $('.custom-detail-input-icon-mrv').attr('data-glyph', icon);
        $('.custom-detail-input-mrv').val(currentValue);
        $('.custom-detail-element-mrv').val($(elementWithOption).attr('variant-editable-mrv')).attr('variant-refresh-mrv', refresh);
        $('.custom-detail-attribute-mrv').val(optionArray.attribute);
        $('.custom-detail-title-mrv').text(optionArray.modalTitle);



        // Show Button if necessary
        // Don't show button if prompting now (from a section control attribute button)
        if (typeof promptNow !== "undefined" && promptNow === true) {
            promptCustomOption();
        } else {
            if ($(element).is('section, header')) {
                $('.section-option-button-mrv').text(optionArray.buttonText).attr('data-glyph', icon).removeClass('variant-hidden-mrv');
            } else {
                $('.element-option-button-mrv').text(optionArray.buttonText).attr('data-glyph', icon).removeClass('variant-hidden-mrv');
            }
        }
    }

    function promptCustomOption() {
        $('.custom-detail-modal-mrv').modal({
            autoResize: true,
            overlayClose: true,
            opacity: 0,
            overlayCss: {
                "background-color": "#3e3e3e"
            },
            closeClass: 'modal-close-mrv',
            onShow: function() {
                setTimeout(function() {
                    $('.simplemodal-container').addClass('fade-modal-mrv');
                    $('.simplemodal-overlay').addClass('fade-modal-mrv');
                }, 100);
                initSizes();
            },
            onClose: function() {
                setTimeout(function() {
                    $.modal.close();
                    initSizes();
                }, 300);
                $('.simplemodal-container').removeClass('fade-modal-mrv');
                $('.simplemodal-overlay').removeClass('fade-modal-mrv');
            }
        });
    }

    function saveCustomOption() {
        var elementWithOption = $("#master-html-mrv ." + $('.custom-detail-element-mrv').val()),
            updateValue = $('.custom-detail-input-mrv').val(),
            updateAttribute = $('.custom-detail-attribute-mrv').val(),
            optionsArray = $(elementWithOption).closest('[data-variant-option-mrv]').data('variant-option-mrv');

        if (updateValue.indexOf("<") !== -1) {
            if (($(updateValue).is('iframe')) && ((updateAttribute === "src") || (updateAttribute === "no-src") || (updateAttribute === "data-src"))) {
                updateValue = $(updateValue).attr('src');

                // Handle same-protocol urls by adding http: so that the user will see the video appear straight away
                if (updateValue.substring(0, 2) === "//") {
                    updateValue = 'https:' + updateValue;
                }
                // Add in the embed options for slimming down the player if video is from Youtube
                if (updateValue.indexOf("youtube.com") !== -1) {
                    updateValue += "?showinfo=0&rel=0&modestbranding=1";
                    if (elementWithOption.hasClass('youtube-bg-iframe')) {
                        updateValue += "&enablejsapi=1&autoplay=1&controls=0&loop=1&iv_load_policy=3";
                    }
                }

                if (updateValue.indexOf("vimeo.com") !== -1) {
                    updateValue += "?badge=0&title=0&byline=0";
                }
            }
        }

        if ($(elementWithOption).is('iframe') && (updateAttribute == 'no-src')) {

            $(elementWithOption).attr(updateAttribute, updateValue);
            $(".variant-page-mrv ." + $('.custom-detail-element-mrv').val()).attr('src', updateValue);
        } else {
            $(elementWithOption).attr(updateAttribute, updateValue);
            $(".variant-page-mrv ." + $('.custom-detail-element-mrv').val()).attr(updateAttribute, updateValue);
        }

        saveState();

        if ($('.custom-detail-element-mrv').attr('variant-refresh-mrv') === "true") {
            console.log('Global setting made me refresh() ...');
            refresh();
        }
        $('.custom-detail-element-mrv').removeAttr('refresh');
    }

    function cloneElement(element) {

        console.log('Attempting to clone element: ' + element);
        var closest, pageClone, masterClone, time, uniqueClass;

        if ($('#master-html-mrv .' + element).attr('variant-closest-mrv')) {
            if ($('#master-html-mrv .' + element).attr('variant-closest-mrv') == "parent") {
                element = $('#master-html-mrv .' + element).parent().attr('variant-editable-mrv');
            } else {
                element = $('#master-html-mrv .' + element).closest($('#master-html-mrv .' + element).attr('variant-closest-mrv')).attr('variant-editable-mrv');
            }
        }

        pageClone = $('.variant-page-mrv .' + element).clone();
        masterClone = $('#master-html-mrv .' + element).clone();
        time = new Date().getTime();
        uniqueClass = 'variant-editable-' + time;

        pageClone.attr('variant-editable-mrv', uniqueClass);
        masterClone.attr('variant-editable-mrv', uniqueClass);

        pageClone.alterClass('variant-editable-*', '');
        masterClone.alterClass('variant-editable-*', '');

        pageClone.addClass(uniqueClass);
        masterClone.addClass(uniqueClass);

        pageClone.find('p, span, a, h1, h2, h3, h4, h5, h6, strong, em, ul, li, div, i, img, iframe, blockquote, figcaption, tbody, tr, td, th, form').each(function(index) {
            var uniqueClass = 'variant-editable-' + time + '-' + index;
            $(this).attr('variant-editable-mrv', uniqueClass);
            $(this).alterClass('variant-editable-*', '');
            $(this).addClass(uniqueClass);
        });

        masterClone.find('p, span, a, h1, h2, h3, h4, h5, h6, strong, em, ul, li, div, i, img, iframe, blockquote, figcaption, tbody, tr, td, th, form').each(function(index) {
            var uniqueClass = 'variant-editable-' + time + '-' + index;
            $(this).attr('variant-editable-mrv', uniqueClass);
            $(this).alterClass('variant-editable-*', '');
            $(this).addClass(uniqueClass);
        });

        pageClone.insertAfter($('.variant-page-mrv .' + element));
        masterClone.insertAfter($('#master-html-mrv .' + element));
        masterClone.insertAfter($('#custom-nav-bank-mrv .' + element));

        saveState(); // Save State also saves custom navs and footers

        // If this element needs a refresh, refresh to reinitialize it.
        if ($('#master-html-mrv .' + element).is(variantElementsNeedRefresh)) {
            refresh();
        }

        // In case of a Work Item or slide, refresh to fix height of container.
        $('.variant-page-mrv .' + element).parents().each(function() {
            if ($(this).is(variantParentsCauseRefresh)) {
                refresh();
            }
        });

        $('.variant-context-menu-mrv').hide();

    }

    function deleteElement(element, remove) {

        var elementParents = $('.variant-page-mrv .' + element).parents(),
            elementNeedsRefresh = $('#master-html-mrv .' + element).is(variantElementsNeedRefresh) ? true : false;

        if ($('#master-html-mrv .' + element).attr('variant-closest-mrv')) {
            if ($('#master-html-mrv .' + element).attr('variant-closest-mrv') == "parent") {
                element = $('#master-html-mrv .' + element).parent().attr('variant-editable-mrv');
            } else {
                element = $('#master-html-mrv .' + element).closest($('#master-html-mrv .' + element).attr('variant-closest-mrv')).attr('variant-editable-mrv');
            }
        }

        //  For deleting something else using a selector when deleting. For instance, removing the sidebar menu when deleting the toggle button
        if ($('#master-html-mrv .' + element).attr('variant-also-mrv')) {
            also = $('#master-html-mrv .' + element).closest('nav, section, header, footer').find($('#master-html-mrv .' + element).attr('variant-also-mrv')).attr('variant-editable-mrv');
            console.log('Also delete this element: ' + also)
        } else {
            also = element;
        }



        remove = typeof remove !== 'undefined' ? remove : false;

        if (remove === true) {
            $('.variant-page-mrv .' + element).remove();
            $('#master-html-mrv .' + element).remove();
        }


        if ($('.hide-trashed-button-mrv').length) {

            $('.variant-page-mrv .' + element + ', .variant-page-mrv .' + also).addClass('variant-show-deleted-mrv').removeClass('variant-undeleted-mrv');
            $('#master-html-mrv .' + element + ', #master-html-mrv .' + also).addClass('variant-show-deleted-mrv').removeClass('variant-undeleted-mrv');
        } else {
            $('.variant-page-mrv .' + element + ', .variant-page-mrv .' + also).addClass('variant-deleted-mrv').removeClass('variant-undeleted-mrv');
            $('#master-html-mrv .' + element + ', #master-html-mrv .' + also).addClass('variant-deleted-mrv').removeClass('variant-undeleted-mrv');
        }

        // If this element needs a refresh, refresh to reinitialize it.
        if (elementNeedsRefresh) {
            refresh();
        } else {
            // In case of a Work Item or slide, refresh to fix height of container.
            elementParents.each(function() {
                if ($(this).is(variantParentsCauseRefresh)) {
                    refresh();
                }
            });
        }

        saveState(); // Save State also saves custom navs and footers
        $('.variant-context-menu-mrv').hide();

    }

    function recursiveDelete(element) {
        console.log('[Recursive Delete] Starting on - ' + $(element).attr('variant-editable-mrv'));

        if ($(element).siblings().length) {
            console.log('[Recursive Delete] Element has siblings - ' + $(element).attr('variant-editable-mrv'));
            $(element).remove();
            console.log('[Recursive Delete] Removing element - ' + $(element).attr('variant-editable-mrv'));
            return;
        } else {
            console.log('[Recursive Delete] No siblings found - ' + $(element).attr('variant-editable-mrv'));
            if ($(element).parent().length) {

                console.log('[Recursive Delete] Setting next element to - ' + $(element).parent().attr('variant-editable-mrv'));
                var next = $(element).parent();

                console.log('[Recursive Delete] Removing element - ' + $(element).attr('variant-editable-mrv'));
                $(element).remove();

                console.log('[Recursive Delete] Calling recursiveDelete with - ' + $(next).attr('variant-editable-mrv'));
                return recursiveDelete(next);
            } else {
                console.log('[Recursive Delete] No parent found... stopping.');
                return;
            }
        }
    }

    function setLinkHref() {
        var aLink = $('.' + $('.edit-link-id-mrv').val()),
            suppliedHref = $('.edit-link-href-mrv').val(),
            linkTarget = $('.edit-link-target-mrv').val();

        console.log(suppliedHref.substring(0, 4));
        if (aLink.hasClass('lightbox-link-mrv')) {

            // Sets the title of the image on the link using a data attribute from the Alt text of the image
            if (aLink.find('img[alt]').length) {
                aLink.attr('data-title', aLink.find('img').attr('alt'));
            }

            if (suppliedHref.substring(0, 4) == "img/") {
                suppliedHref = suppliedHref.replace('img/', '../img/');
            }
        }
        aLink.removeClass('inner-link').attr('href', suppliedHref).attr('target', linkTarget);
        if (suppliedHref.indexOf("#") != -1) {
            aLink.addClass('inner-link');
        }
        saveState();
    }

    function setImageSrc() {

        var suppliedSrc = $('.edit-image-src-mrv').val(),
            targetImg = $('.' + $('.edit-image-id-mrv').val());

        if (suppliedSrc.substring(0, 4) == "img/") {
            suppliedSrc = suppliedSrc.replace('img/', '../img/');
        }
        targetImg.attr('src', suppliedSrc);
        targetImg.attr('alt', $('.edit-image-alt-mrv').val());

        // Sets the title of the image on the link using a data attribute from the Alt text of the image
        if (targetImg.closest('a.lightbox-link-mrv').length) {
            targetImg.closest('a.lightbox-link-mrv').attr('data-title', targetImg.attr('alt')).attr('href', suppliedSrc);;

        }

        if (targetImg.hasClass('background-image')) {
            refresh();
        }

        saveState();
    }

    function setVideoSrc() {

        var suppliedMp4Src = $('.edit-mp4-src-mrv').val(),
            suppliedWebmSrc = $('.edit-webm-src-mrv').val(),
            suppliedOg4Src = $('.edit-ogv-src-mrv').val(),
            targetVideo = $('.' + $('.edit-video-id-mrv').val());



        if (suppliedMp4Src.length) {
            if (suppliedMp4Src.substring(0, 6) == "video/") {
                suppliedMp4Src = suppliedMp4Src.replace('video/', '../video/');
            }
        }

        if (suppliedWebmSrc.length) {
            if (suppliedWebmSrc.substring(0, 6) == "video/") {
                suppliedWebmSrc = suppliedWebmSrc.replace('video/', '../video/');
            }
        }

        if (suppliedOg4Src.length) {
            if (suppliedOg4Src.substring(0, 6) == "video/") {
                suppliedOg4Src = suppliedOg4Src.replace('video/', '../video/');
            }
        }

        targetVideo.find('source[type="video/mp4"]').attr('src', suppliedMp4Src);
        targetVideo.find('source[type="video/webm"]').attr('src', suppliedWebmSrc);
        targetVideo.find('source[type="video/ogg"]').attr('src', suppliedOg4Src);
        refresh();
        saveState();
    }

    function updateChooserList(e) {
        var files = e.target.files,
            output = [],
            i, f, nextColumn;

        nextColumn = $('.image-chooser-gallery-mrv .variant-gallery-column-mrv').first();
        if (nextColumn.children().length > nextColumn.next('.image-chooser-gallery-mrv .variant-gallery-column-mrv').children().length) {
            nextColumn = nextColumn.next('.image-chooser-gallery-mrv .variant-gallery-column-mrv');
        }
        if (nextColumn.children().length > nextColumn.next('.image-chooser-gallery-mrv .variant-gallery-column-mrv').children().length) {
            nextColumn = nextColumn.next('.image-chooser-gallery-mrv .variant-gallery-column-mrv');
        }
        for (i = 0; f = files[i]; i++) {


            if (!$('#gallery-bank-mrv [variant-original-name-mrv="' + f.name + '"]').length) {
                $('#gallery-bank-mrv [variant-original-name-mrv="' + f.name + '"]').remove();
                // This src="..." is not delayed because they are only appended when the user selects files. 
                $(nextColumn).append('<div class="image-chooser-thumbnail-mrv"><img class="edit-image-gallery-image-mrv" src="../img/' + f.name + '" variant-original-name-mrv="' + f.name + '" onerror="window.mr_variant.chooserImageError(this)"/><span class="vertical-middle"></span><span class="image-thumbnail-res-mrv"></span></div>');
            }
            if ($(nextColumn).is('.image-chooser-gallery-mrv .variant-gallery-column-mrv:last')) {
                nextColumn = $('.image-chooser-gallery-mrv .variant-gallery-column-mrv:first');
            } else {
                nextColumn = $(nextColumn).next('.image-chooser-gallery-mrv .variant-gallery-column-mrv');
            }
        }
        saveGallery();
    }

    this.chooserImageError = function(image) {
        $(image).parent().addClass('no-image');
        $(image).parent().find('.vertical-middle').html('Copy <strong>' + $(image).attr('variant-original-name-mrv') + '</strong> to your img folder then click here to refresh.');
        $(image).css('display', 'none');
    }

    this.defaultImageError = function(image) {
        $(image).parent().remove();
        $(image).remove();
    }

    function loadDefaultImages() {
        var column1 = $('<div />').addClass('variant-gallery-column-mrv'),
            column2 = $('<div />').addClass('variant-gallery-column-mrv'),
            column3 = $('<div />').addClass('variant-gallery-column-mrv'),
            image = "";

        if ($.localStorage(templateNameSpace + '.gallery.images')) {
            console.groupCollapsed('Gallery ALERT');
            console.error('Filling gallery-bank-mrv with local storage data $.localStorage(templateNameSpace+\'.gallery.images\'): ' + $.localStorage(templateNameSpace + '.gallery.images'));
            console.groupEnd();
            $('#gallery-bank-mrv').html($.localStorage(templateNameSpace + '.gallery.images'));
            $('#gallery-bank-mrv div').each(function() {
                if (!$(this).find('img').length) {
                    console.groupCollapsed('Gallery ALERT');
                    console.error('removing a div from gallery-bank-mrv');
                    console.groupEnd();
                    $(this).remove();
                }
                if ($(this).hasClass('no-image')) {
                    console.groupCollapsed('Gallery ALERT');
                    console.error('removing a div with no-image class from gallery-bank-mrv');
                    console.groupEnd();
                    $(this).remove();
                }
            });

        } else {
            var defaultImages = $('.image-edit-chooser-mrv').attr('default-images-mrv').split(',');
            defaultImages.forEach(function(name, index) {
                // Delay the loading of the gallery images by prepending them with delay- on document ready, 
                // then on window load they will be changed back to src to delay loading and speed up initial page load time.
                // Beneficial because these also reference the same images as the section bank which are already delay-src'd by grunt.

                image = '<div class="image-chooser-thumbnail-mrv"><img class="edit-image-gallery-image-mrv" delay-src="../img/' + name + '" variant-original-name-mrv="' + name + '" onerror="window.mr_variant.defaultImageError(this)"/><span class="image-thumbnail-res-mrv"></span></div>';

                if (index % 3 === 0) {
                    column3.append(image);
                } else if (index % 2 === 0) {
                    column2.append(image);
                } else {
                    column1.append(image);
                }

                console.groupCollapsed('Gallery ALERT');
                console.error('filling gallery bank from this data in three columns in loadDefaultImages: ' + column1 + column2 + column3);
                console.groupEnd();
                $('#gallery-bank-mrv').append(column1).append(column2).append(column3);
            });
        }
    }

    function saveGallery() {
        console.groupCollapsed('Gallery ALERT');
        console.warn('Storing the following data to $.localStorage(templateNameSpace+\'.gallery.images\' from $(\'.image-chooser-gallery-mrv\').html(): ' + $('.image-chooser-gallery-mrv').html());
        console.groupEnd();
        $.localStorage(templateNameSpace + '.gallery.images', $('.image-chooser-gallery-mrv').html());
        console.groupCollapsed('Gallery ALERT');
        console.error("SAVEGALLERY ON LINE 2828: gallery-bank-mrv is being written with this content from $('.image-chooser-gallery-mrv').html() : " + $('.image-chooser-gallery-mrv').html());
        console.groupEnd();
        $('#gallery-bank-mrv').html($('.image-chooser-gallery-mrv').html());
    }

    function refreshLostImage(lostImage) {
        var image = $(lostImage).find('img'),
            lastImage, resolutionSpan;



        image.attr('src', '');
        image.attr('src', '../img/' + image.attr('variant-original-name-mrv'));
        image.css('display', 'inline');
        $(lostImage).removeClass('no-image');
        $(lostImage).find('.vertical-middle, .image-thumbnail-res-mrv').html('');


    }

    function loadIcons() {
        var iconPacks,
            set = '',
            tabs = $('<ul class="variant-icon-tabs-mrv">'),
            sets = $('<ul class="variant-icon-sets-mrv">');

        if ($('#variant-icon-packs-mrv').length) {
            try {
                iconPacks = JSON.parse($('#variant-icon-packs-mrv').html()).iconPacks;

                iconPacks.forEach(function(pack) {
                    tabs.append($('<li><span>' + pack.name + '</span></li>'))
                    set = '<li class="icon-pack-list-info-mrv"><span class="icon-list-title-mrv">' + pack.name + '</span> <span class="icon-pack-count-mrv">' + pack.icons.length + ' icons </span><span class="icon-pack-website-mrv"><a target="_blank" href="' + pack.url + '">more info</a></span></li>';
                    set += '<li class="icon-pack-list-mrv">';
                    pack.icons.forEach(function(name) {
                        set += '<div class="choosable-icon-mrv" icon-filter-mrv="' + name.replace(pack.iconPrefix, "") + '"><i class="icon ' + pack.iconClass + ' ' + name + '" icon-class="' + pack.iconClass + ' ' + name + '" title="' + name + '"></i></div>';
                    });
                    set += "</li>";
                    sets.append(set);
                });

                $(tabs).find('li:first').addClass('variant-active-mrv');
                $(sets).find('li.icon-pack-list-info-mrv:first, li.icon-pack-list-mrv:first').addClass('variant-active-mrv');
                $('.edit-icons-container-mrv').html('').append(tabs).append(sets);

                return iconPacks;
            } catch (err) {
                console.log('Error parsing icon packs JSON: ' + err.message);
                return JSON.parse('{"iconPacks":[]}');
            }
        }
    }

    function loadSections() {
        var sectionChooser = $('.section-thumbs-container-mrv'),
            content = '',
            sectionFilters = $('.section-filters-mrv'),
            filters = '';
        // Populate the section selection area with thumbnails
        $('#section-bank-mrv .variant-meta-mrv').each(function(index) {
            var section = $(this),
                filterTags = section.attr('data-filter-mrv').split(','),
                sectionIcons, icons = '';
            filterTags.forEach(function(tagName) {
                if (filters.indexOf(tagName) == -1) {
                    filters += '<div class="section-filter-mrv" data-filter-mrv="' + tagName + '">' + tagName + '</div>';
                }
            });

            sectionIcons = section.attr('icons');

            if (typeof sectionIcons !== typeof undefined && sectionIcons !== false) {
                sectionIcons = section.attr('icons').split(',');
                sectionIcons.forEach(function(icon) {
                    icons += '<img class="section-icon-mrv" src="img/' + icon + '.png" />';
                });

            }
            // Delay the loading of the section thumbnails by prepending them with delay- on document ready, 
            // then on window load they will be changed back to src to delay loading and speed up initial page load time.
            content += '<div class="section-thumb-mrv" data-filter-mrv="' + $(this).attr('data-filter-mrv') + '" sidebar-section-id-mrv="' + $(this).attr('id') + '"><img delay-src="img/sections/' + $(this).attr('id') + '.jpg"/>' + icons + '<span class="variant-title-mrv">' + $(this).attr('data-section-name-mrv') + '</span></div>';
        });
        sectionChooser.html(content);
        sectionFilters.append(filters);

    }

    function increaseWidth(element) {
        var rawElement = $('.' + element);
        // Increase or decrease width
        if ($(rawElement).is('p , div, span, figure, article, img')) {

            // For Foundation
            if ($(rawElement).is('[class*="medium-"]') || $(rawElement).parent().is('div [class*="medium-"]')) {

                if ($(rawElement).parent().is('div [class*="medium-"]')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('medium-12')) {
                    if (rawElement.hasClass('medium-11')) {
                        rawElement.removeClass('medium-11').addClass('medium-12');
                        return;
                    } else if (rawElement.hasClass('medium-10')) {
                        rawElement.removeClass('medium-10').addClass('medium-11');
                        return;
                    } else if (rawElement.hasClass('medium-9')) {
                        rawElement.removeClass('medium-9').addClass('medium-10');
                        return;
                    } else if (rawElement.hasClass('medium-8')) {
                        rawElement.removeClass('medium-8').addClass('medium-9');
                        return;
                    } else if (rawElement.hasClass('medium-7')) {
                        rawElement.removeClass('medium-7').addClass('medium-8');
                        return;
                    } else if (rawElement.hasClass('medium-6')) {
                        rawElement.removeClass('medium-6').addClass('medium-7');
                        return;
                    } else if (rawElement.hasClass('medium-5')) {
                        rawElement.removeClass('medium-5').addClass('medium-6');
                        return;
                    } else if (rawElement.hasClass('medium-4')) {
                        rawElement.removeClass('medium-4').addClass('medium-5');
                        return;
                    } else if (rawElement.hasClass('medium-3')) {
                        rawElement.removeClass('medium-3').addClass('medium-4');
                        return;
                    } else if (rawElement.hasClass('medium-2')) {
                        rawElement.removeClass('medium-2').addClass('medium-3');
                        return;
                    } else if (rawElement.hasClass('medium-1')) {
                        rawElement.removeClass('medium-1').addClass('medium-2');
                        return;
                    }
                }
            }
            // For Bootstrap
            else if ($(rawElement).is('[class*="col-xs-"]:not([class*="col-md-"])') || $(rawElement).parent().is('div [class*="col-xs-"]:not([class*="col-md-"])')) {

                if ($(rawElement).parent().is('div [class*="col-xs-"]:not([class*="col-md-"])')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-xs-12')) {
                    if (rawElement.hasClass('col-xs-11')) {
                        rawElement.removeClass('col-xs-11').addClass('col-xs-12');
                        return;
                    } else if (rawElement.hasClass('col-xs-10')) {
                        rawElement.removeClass('col-xs-10').addClass('col-xs-11');
                        return;
                    } else if (rawElement.hasClass('col-xs-9')) {
                        rawElement.removeClass('col-xs-9').addClass('col-xs-10');
                        return;
                    } else if (rawElement.hasClass('col-xs-8')) {
                        rawElement.removeClass('col-xs-8').addClass('col-xs-9');
                        return;
                    } else if (rawElement.hasClass('col-xs-7')) {
                        rawElement.removeClass('col-xs-7').addClass('col-xs-8');
                        return;
                    } else if (rawElement.hasClass('col-xs-6')) {
                        rawElement.removeClass('col-xs-6').addClass('col-xs-7');
                        return;
                    } else if (rawElement.hasClass('col-xs-5')) {
                        rawElement.removeClass('col-xs-5').addClass('col-xs-6');
                        return;
                    } else if (rawElement.hasClass('col-xs-4')) {
                        rawElement.removeClass('col-xs-4').addClass('col-xs-5');
                        return;
                    } else if (rawElement.hasClass('col-xs-3')) {
                        rawElement.removeClass('col-xs-3').addClass('col-xs-4');
                        return;
                    } else if (rawElement.hasClass('col-xs-2')) {
                        rawElement.removeClass('col-xs-2').addClass('col-xs-3');
                        return;
                    } else if (rawElement.hasClass('col-xs-1')) {
                        rawElement.removeClass('col-xs-1').addClass('col-xs-2');
                        return;
                    }
                }
            } else if ($(rawElement).is('[class*="col-sm-"]:not([class*="col-md-"])') || $(rawElement).parent().is('div [class*="col-sm-"]:not([class*="col-md-"])')) {

                if ($(rawElement).parent().is('div [class*="col-sm-"]:not([class*="col-md-"])')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-sm-12')) {
                    if (rawElement.hasClass('col-sm-11')) {
                        rawElement.removeClass('col-sm-11').addClass('col-sm-12');
                        return;
                    } else if (rawElement.hasClass('col-sm-10')) {
                        rawElement.removeClass('col-sm-10').addClass('col-sm-11');
                        return;
                    } else if (rawElement.hasClass('col-sm-9')) {
                        rawElement.removeClass('col-sm-9').addClass('col-sm-10');
                        return;
                    } else if (rawElement.hasClass('col-sm-8')) {
                        rawElement.removeClass('col-sm-8').addClass('col-sm-9');
                        return;
                    } else if (rawElement.hasClass('col-sm-7')) {
                        rawElement.removeClass('col-sm-7').addClass('col-sm-8');
                        return;
                    } else if (rawElement.hasClass('col-sm-6')) {
                        rawElement.removeClass('col-sm-6').addClass('col-sm-7');
                        return;
                    } else if (rawElement.hasClass('col-sm-5')) {
                        rawElement.removeClass('col-sm-5').addClass('col-sm-6');
                        return;
                    } else if (rawElement.hasClass('col-sm-4')) {
                        rawElement.removeClass('col-sm-4').addClass('col-sm-5');
                        return;
                    } else if (rawElement.hasClass('col-sm-3')) {
                        rawElement.removeClass('col-sm-3').addClass('col-sm-4');
                        return;
                    } else if (rawElement.hasClass('col-sm-2')) {
                        rawElement.removeClass('col-sm-2').addClass('col-sm-3');
                        return;
                    } else if (rawElement.hasClass('col-sm-1')) {
                        rawElement.removeClass('col-sm-1').addClass('col-sm-2');
                        return;
                    }
                }
            } else if ($(rawElement).is('[class*="col-md-"]') || $(rawElement).parent().is('div [class*="col-md-"]')) {

                if ($(rawElement).parent().is('div [class*="col-md-"]')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-md-12')) {
                    if (rawElement.hasClass('col-md-11')) {
                        rawElement.removeClass('col-md-11').addClass('col-md-12');
                        return;
                    } else if (rawElement.hasClass('col-md-10')) {
                        rawElement.removeClass('col-md-10').addClass('col-md-11');
                        return;
                    } else if (rawElement.hasClass('col-md-9')) {
                        rawElement.removeClass('col-md-9').addClass('col-md-10');
                        return;
                    } else if (rawElement.hasClass('col-md-8')) {
                        rawElement.removeClass('col-md-8').addClass('col-md-9');
                        return;
                    } else if (rawElement.hasClass('col-md-7')) {
                        rawElement.removeClass('col-md-7').addClass('col-md-8');
                        return;
                    } else if (rawElement.hasClass('col-md-6')) {
                        rawElement.removeClass('col-md-6').addClass('col-md-7');
                        return;
                    } else if (rawElement.hasClass('col-md-5')) {
                        rawElement.removeClass('col-md-5').addClass('col-md-6');
                        return;
                    } else if (rawElement.hasClass('col-md-4')) {
                        rawElement.removeClass('col-md-4').addClass('col-md-5');
                        return;
                    } else if (rawElement.hasClass('col-md-3')) {
                        rawElement.removeClass('col-md-3').addClass('col-md-4');
                        return;
                    } else if (rawElement.hasClass('col-md-2')) {
                        rawElement.removeClass('col-md-2').addClass('col-md-3');
                        return;
                    } else if (rawElement.hasClass('col-md-1')) {
                        rawElement.removeClass('col-md-1').addClass('col-md-2');
                        return;
                    }
                }
            }


        }


        saveState();
    }

    function decreaseWidth(element) {
        var rawElement = $('.' + element);
        // Increase or decrease width
        if ($(rawElement).is('p , div, span, figure, article, img')) {

            // For Foundation
            if ($(rawElement).is('[class*="medium-"]') || $(rawElement).parent().is('div [class*="medium-"]')) {

                if ($(rawElement).parent().is('div [class*="medium-"]')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('medium-1')) {
                    if (rawElement.hasClass('medium-12')) {
                        rawElement.removeClass('medium-12').addClass('medium-11');
                        return;
                    } else if (rawElement.hasClass('medium-11')) {
                        rawElement.removeClass('medium-11').addClass('medium-10');
                        return;
                    } else if (rawElement.hasClass('medium-10')) {
                        rawElement.removeClass('medium-10').addClass('medium-9');
                        return;
                    } else if (rawElement.hasClass('medium-9')) {
                        rawElement.removeClass('medium-9').addClass('medium-8');
                        return;
                    } else if (rawElement.hasClass('medium-8')) {
                        rawElement.removeClass('medium-8').addClass('medium-7');
                        return;
                    } else if (rawElement.hasClass('medium-7')) {
                        rawElement.removeClass('medium-7').addClass('medium-6');
                        return;
                    } else if (rawElement.hasClass('medium-6')) {
                        rawElement.removeClass('medium-6').addClass('medium-5');
                        return;
                    } else if (rawElement.hasClass('medium-5')) {
                        rawElement.removeClass('medium-5').addClass('medium-4');
                        return;
                    } else if (rawElement.hasClass('medium-4')) {
                        rawElement.removeClass('medium-4').addClass('medium-3');
                        return;
                    } else if (rawElement.hasClass('medium-3')) {
                        rawElement.removeClass('medium-3').addClass('medium-2');
                        return;
                    } else if (rawElement.hasClass('medium-2')) {
                        rawElement.removeClass('medium-2').addClass('medium-1');
                        return;
                    }
                }
            }
            // Bootstrap
            else if ($(rawElement).is('[class*="col-xs-"]:not([class*="col-md-"])') || $(rawElement).parent().is('div [class*="col-xs-"]:not([class*="col-md-"])')) {

                if ($(rawElement).parent().is('div [class*="col-xs-"]:not([class*="col-md-"])')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-xs-1')) {
                    if (rawElement.hasClass('col-xs-12')) {
                        rawElement.removeClass('col-xs-12').addClass('col-xs-11');
                        return;
                    } else if (rawElement.hasClass('col-xs-11')) {
                        rawElement.removeClass('col-xs-11').addClass('col-xs-10');
                        return;
                    } else if (rawElement.hasClass('col-xs-10')) {
                        rawElement.removeClass('col-xs-10').addClass('col-xs-9');
                        return;
                    } else if (rawElement.hasClass('col-xs-9')) {
                        rawElement.removeClass('col-xs-9').addClass('col-xs-8');
                        return;
                    } else if (rawElement.hasClass('col-xs-8')) {
                        rawElement.removeClass('col-xs-8').addClass('col-xs-7');
                        return;
                    } else if (rawElement.hasClass('col-xs-7')) {
                        rawElement.removeClass('col-xs-7').addClass('col-xs-6');
                        return;
                    } else if (rawElement.hasClass('col-xs-6')) {
                        rawElement.removeClass('col-xs-6').addClass('col-xs-5');
                        return;
                    } else if (rawElement.hasClass('col-xs-5')) {
                        rawElement.removeClass('col-xs-5').addClass('col-xs-4');
                        return;
                    } else if (rawElement.hasClass('col-xs-4')) {
                        rawElement.removeClass('col-xs-4').addClass('col-xs-3');
                        return;
                    } else if (rawElement.hasClass('col-xs-3')) {
                        rawElement.removeClass('col-xs-3').addClass('col-xs-2');
                        return;
                    } else if (rawElement.hasClass('col-xs-2')) {
                        rawElement.removeClass('col-xs-2').addClass('col-xs-1');
                        return;
                    }
                }
            } else if ($(rawElement).is('[class*="col-sm-"]:not([class*="col-md-"])') || $(rawElement).parent().is('div [class*="col-sm-"]:not([class*="col-md-"])')) {

                if ($(rawElement).parent().is('div [class*="col-sm-"]:not([class*="col-md-"])')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-sm-1')) {
                    if (rawElement.hasClass('col-sm-12')) {
                        rawElement.removeClass('col-sm-12').addClass('col-sm-11');
                        return;
                    } else if (rawElement.hasClass('col-sm-11')) {
                        rawElement.removeClass('col-sm-11').addClass('col-sm-10');
                        return;
                    } else if (rawElement.hasClass('col-sm-10')) {
                        rawElement.removeClass('col-sm-10').addClass('col-sm-9');
                        return;
                    } else if (rawElement.hasClass('col-sm-9')) {
                        rawElement.removeClass('col-sm-9').addClass('col-sm-8');
                        return;
                    } else if (rawElement.hasClass('col-sm-8')) {
                        rawElement.removeClass('col-sm-8').addClass('col-sm-7');
                        return;
                    } else if (rawElement.hasClass('col-sm-7')) {
                        rawElement.removeClass('col-sm-7').addClass('col-sm-6');
                        return;
                    } else if (rawElement.hasClass('col-sm-6')) {
                        rawElement.removeClass('col-sm-6').addClass('col-sm-5');
                        return;
                    } else if (rawElement.hasClass('col-sm-5')) {
                        rawElement.removeClass('col-sm-5').addClass('col-sm-4');
                        return;
                    } else if (rawElement.hasClass('col-sm-4')) {
                        rawElement.removeClass('col-sm-4').addClass('col-sm-3');
                        return;
                    } else if (rawElement.hasClass('col-sm-3')) {
                        rawElement.removeClass('col-sm-3').addClass('col-sm-2');
                        return;
                    } else if (rawElement.hasClass('col-sm-2')) {
                        rawElement.removeClass('col-sm-2').addClass('col-sm-1');
                        return;
                    }
                }
            } else if ($(rawElement).is('[class*="col-md-"]') || $(rawElement).parent().is('div [class*="col-md-"]')) {

                if ($(rawElement).parent().is('div [class*="col-md-"]')) {
                    rawElement = $(rawElement).parent();
                }

                if (!$(rawElement).hasClass('col-md-1')) {
                    if (rawElement.hasClass('col-md-12')) {
                        rawElement.removeClass('col-md-12').addClass('col-md-11');
                        return;
                    } else if (rawElement.hasClass('col-md-11')) {
                        rawElement.removeClass('col-md-11').addClass('col-md-10');
                        return;
                    } else if (rawElement.hasClass('col-md-10')) {
                        rawElement.removeClass('col-md-10').addClass('col-md-9');
                        return;
                    } else if (rawElement.hasClass('col-md-9')) {
                        rawElement.removeClass('col-md-9').addClass('col-md-8');
                        return;
                    } else if (rawElement.hasClass('col-md-8')) {
                        rawElement.removeClass('col-md-8').addClass('col-md-7');
                        return;
                    } else if (rawElement.hasClass('col-md-7')) {
                        rawElement.removeClass('col-md-7').addClass('col-md-6');
                        return;
                    } else if (rawElement.hasClass('col-md-6')) {
                        rawElement.removeClass('col-md-6').addClass('col-md-5');
                        return;
                    } else if (rawElement.hasClass('col-md-5')) {
                        rawElement.removeClass('col-md-5').addClass('col-md-4');
                        return;
                    } else if (rawElement.hasClass('col-md-4')) {
                        rawElement.removeClass('col-md-4').addClass('col-md-3');
                        return;
                    } else if (rawElement.hasClass('col-md-3')) {
                        rawElement.removeClass('col-md-3').addClass('col-md-2');
                        return;
                    } else if (rawElement.hasClass('col-md-2')) {
                        rawElement.removeClass('col-md-2').addClass('col-md-1');
                        return;
                    }
                }
            }
        }

        saveState();
    }

    function updateInPageNav(element) {
        var target, currentLink, usingCurrentLink;
        console.log('Updating In-page nav links.');
        if (!$('[variant-inner-links-to-mrv=' + $(element).parent().parent().attr('data-section-id-mrv') + ']').length) {
            target = $('.' + $(element).parent().parent().attr('data-section-id-mrv'));
            target.before('<a id="' + convertToSlug($(element).text()) + '" class="in-page-link" variant-inner-link-name-mrv="' + $(element).text() + '" variant-inner-links-to-mrv="' + $(element).parent().parent().attr('data-section-id-mrv') + '"></a>');
        } else {
            currentLink = $('[variant-inner-links-to-mrv=' + $(element).parent().parent().attr('data-section-id-mrv') + ']').attr('id');
            // Find all links to this [a] so that they can be updated with the new slug.
            usingCurrentLink = $('.variant-page-mrv[href="#' + $('[variant-inner-links-to-mrv=' + $(element).parent().parent().attr('data-section-id-mrv') + ']').attr('id') + '"], #master-html-mrv [href="#' + $('[variant-inner-links-to-mrv=' + $(element).parent().parent().attr('data-section-id-mrv') + ']').attr('id') + '"]');
            usingCurrentLink.attr('href', '#' + convertToSlug($(element).text()));
            updateCustomNavs();
            $('[variant-inner-links-to-mrv=' + $(element).parent().parent().attr('data-section-id-mrv') + ']').attr('id', convertToSlug($(element).text())).attr('variant-inner-link-name-mrv', $(element).text());
        }
    }

    function convertToSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    function populateInpageLinkOptions() {
        $('.select-inner-link-mrv').addClass('variant-hidden-mrv');
        var links = $(mrv_masterContentTarget).find('.in-page-link');
        if (links.length) {
            output = '<option value="">Select an in-page navigation link</option>';
            links.each(function() {
                var aLink = $(this);
                output += '<option value="#' + aLink.attr('id') + '">' + aLink.attr('variant-inner-link-name-mrv') + '</option>';
            });
            $('.inner-link-options-mrv').html(output);
            $('.select-inner-link-mrv').removeClass('variant-hidden-mrv');
        }
    }

    function saveState() {
        console.groupCollapsed('Saving...');
        var lastStateID = $.localStorage(templateNameSpace + '.state.last-state-id-mrv');
        $('.startup-button-mrv').addClass('variant-hidden-mrv');
        updateCustomNavs();
        updateCustomFooters();

        if ($.localStorage(templateNameSpace + '.state.last-state-id-mrv')) {

            $.localStorage(templateNameSpace + '.state.master-html-mrv.' + lastStateID, $('#master-html-mrv').html());
            $.localStorage(templateNameSpace + '.state.layout-map-mrv.' + lastStateID, $('.layout-map-mrv').html());
            $.localStorage(templateNameSpace + '.state.page-title-mrv.' + lastStateID, $('.input-page-title-mrv').text());
            $.localStorage(templateNameSpace + '.state.colour-scheme-mrv.' + lastStateID, $('.colour-schemes-list-mrv').attr('variant-current-css-mrv'));
            $.localStorage(templateNameSpace + '.state.font-option-mrv.' + lastStateID, $('.variant-font-options-list-mrv').attr('variant-current-font-mrv'));
            $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + lastStateID, (typeof $('#variant-body-classes-mrv').attr('class') !== "undefined" ? $('#variant-body-classes-mrv').attr('class') : " "));
        } else {
            $.localStorage(templateNameSpace + '.state.master-html-mrv', $('#master-html-mrv').html());
            $.localStorage(templateNameSpace + '.state.layout-map-mrv', $('.layout-map-mrv').html());
            $.localStorage(templateNameSpace + '.state.page-title-mrv', $('.input-page-title-mrv').text());
            $.localStorage(templateNameSpace + '.state.colour-scheme-mrv', $('.colour-schemes-list-mrv').attr('variant-current-css-mrv'));
            $.localStorage(templateNameSpace + '.state.font-option-mrv', $('.variant-font-options-list-mrv').attr('variant-current-font-mrv'));
            $.localStorage(templateNameSpace + '.state.body-classes-mrv', (typeof $('#variant-body-classes-mrv').attr('class') !== "undefined" ? $('#variant-body-classes-mrv').attr('class') : " "));


            console.log('Stored body Classes after save state: "' + $.localStorage(templateNameSpace + '.state.body-classes-mrv') + '"');
        }

        console.log('Saved state');
        console.groupEnd();
    }

    function saveStateAs() {

        var time = new Date().getTime();
        newStateName = $('.save-page-name-mrv').val();
        stateID = 'variant-saved-state-mrv-' + time;
        $('#state-bank-mrv').append('<li class="variant-saved-state-mrv" variant-saved-state-mrv="' + stateID + '" variant-state-name-mrv="' + newStateName + '" page-title="' + $('.input-page-title-mrv').text() + '"></li>');
        addPageToList(newStateName, stateID);
        console.log($('#state-bank-mrv [variant-saved-state-mrv="' + $.localStorage(templateNameSpace + '.state.last-state-id-mrv') + '"]'));
        $('#state-bank-mrv [variant-saved-state-mrv="' + $.localStorage(templateNameSpace + '.state.last-state-id-mrv') + '"]').attr('page-title', $('.input-page-title-mrv').text());
        $.localStorage(templateNameSpace + '.state.state-bank-mrv', $('#state-bank-mrv').html());
        $.localStorage(templateNameSpace + '.state.master-html-mrv.' + stateID, $('#master-html-mrv').html());
        $.localStorage(templateNameSpace + '.state.layout-map-mrv.' + stateID, $('.layout-map-mrv').html());
        $.localStorage(templateNameSpace + '.state.page-title-mrv.' + stateID, $('.input-page-title-mrv').text());
        $.localStorage(templateNameSpace + '.state.colour-scheme-mrv.' + stateID, $('.colour-schemes-list-mrv').attr('variant-current-css-mrv'));
        $.localStorage(templateNameSpace + '.state.font-option-mrv.' + stateID, $('.variant-font-options-list-mrv').attr('variant-current-font-mrv'));
        $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + stateID, $('#variant-body-classes-mrv').attr('class'));
        $.localStorage(templateNameSpace + '.state.last-state-id-mrv', stateID);
        $.localStorage(templateNameSpace + '.state.last-name-mrv', newStateName);
        $('.editing-page-name-mrv').text(newStateName).removeClass('variant-hidden-mrv');
    }

    function addPageToList(name, id) {
        $('.saved-pages-holder-mrv').prepend('<div class="load-page-button-mrv" variant-state-name-mrv="' + name + '" state-id="' + id + '"><span class="oi export-page-button-mrv" data-glyph="data-transfer-download"></span><span class="saved-page-title-mrv">' + name + '</span><span class="delete-page-button-mrv oi" data-glyph="x"></span></div>');
        if (isSafari) {
            $('.export-page-button-mrv').remove();
        }
    }

    function loadState(stateID, stateName) {

        $('.startup-button-mrv').addClass('variant-hidden-mrv');
        var stateID = typeof stateID !== 'undefined' ? stateID : "",
            stateName = typeof stateName !== 'undefined' ? stateName : "",
            pageTitle = $.localStorage(templateNameSpace + '.state.page-title-mrv'),
            stateMap;

        if (!stateID) {
            stateID = $.localStorage(templateNameSpace + '.state.last-state-id-mrv');
            stateName = $.localStorage(templateNameSpace + '.state.last-name-mrv');

        }


        stateHTML = '.state.master-html-mrv.' + stateID;
        stateMap = '.state.layout-map-mrv.' + stateID;
        colourScheme = '.state.colour-scheme-mrv.' + stateID;
        fontOption = '.state.font-option-mrv.' + stateID;
        bodyClasses = '.state.body-classes-mrv.' + stateID;

        // Grab title from state bank based on stateID if it exists, otherwise set it to "Edit Page Title"
        if ($('#state-bank-mrv [variant-saved-state-mrv="' + stateID + '"]').attr('page-title')) {
            pageTitle = $('#state-bank-mrv [variant-saved-state-mrv="' + stateID + '"]').attr('page-title');
        } else {
            $('.input-page-title-mrv').text('Edit title tag');
            document.title = 'Variant HTML Builder by Medium Rare';
        }

        $.localStorage(templateNameSpace + '.state.last-state-id-mrv', stateID);
        $.localStorage(templateNameSpace + '.state.last-name-mrv', stateName);



        if (!stateID) {
            stateHTML = '.state.master-html-mrv';
            stateMap = '.state.layout-map-mrv';
            colourScheme = '.state.colour-scheme-mrv';
            fontOption = '.state.font-option-mrv';
            bodyClasses = '.state.body-classes-mrv';

            pageTitle = $.localStorage(templateNameSpace + '.state.page-title-mrv');
        }

        if ($.localStorage(templateNameSpace + stateHTML)) {

            if (!stateName) {
                stateName = 'Unnamed page';
            } else {
                stateName = stateName;
            }

            $('.editing-page-name-mrv').text(stateName).removeClass('variant-hidden-mrv');
            $('.input-page-title-mrv').text(pageTitle);
            document.title = pageTitle;
            $('#master-html-mrv').html($.localStorage(templateNameSpace + stateHTML));
            $('.layout-map-mrv').html($.localStorage(templateNameSpace + stateMap));
            applyBodyClasses($.localStorage(templateNameSpace + bodyClasses));
            switchColourScheme($.localStorage(templateNameSpace + colourScheme), false);
            switchFont($.localStorage(templateNameSpace + fontOption), false);
            makeLayoutMapSortable();
            initTargets();
            console.log('Calling: loadOptionalNavClasses();');
            loadOptionalNavClasses();
            refresh();
        }

        if (!$('.layout-map-mrv').find('.added-section-mrv').length) {
            $('.layout-map-mrv').addClass('empty-layout-map-mrv');
        } else {
            $('.layout-map-mrv').removeClass('empty-layout-map-mrv');
        }


    }

    function exportState(stateID) {


        var zip = new JSZip(),
            stateIDs = [],
            time = new Date(),
            zipName, stateHTML, stateMap, exported, exportString, blob;

        if (!$('#state-bank-mrv .variant-saved-state-mrv').length) {
            variantAlert('Export .variant file', 'There is nothing to export.<br /><br />Save at least one page before exporting.');
            return;
        }

        if (stateID == 'all') {
            $('#state-bank-mrv .variant-saved-state-mrv').each(function() {
                stateIDs.push($(this).attr('variant-saved-state-mrv'));
            });
            zipName = 'variant-exported-' + convertToSlug(time.toDateString());

        } else {
            stateIDs.push(stateID);
        }

        stateIDs.forEach(function(thisStateID, index) {

            stateHTML = $.localStorage(templateNameSpace + '.state.master-html-mrv.' + thisStateID);
            stateMap = $.localStorage(templateNameSpace + '.state.layout-map-mrv.' + thisStateID);
            colourScheme = $.localStorage(templateNameSpace + '.state.colour-scheme-mrv.' + thisStateID);
            fontOption = $.localStorage(templateNameSpace + '.state.font-option-mrv.' + thisStateID);
            bodyClasses = $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + thisStateID);
            pageName = $('#state-bank-mrv [variant-saved-state-mrv="' + thisStateID + '"]').attr('variant-state-name-mrv');
            pageTitle = $('#state-bank-mrv [variant-saved-state-mrv="' + thisStateID + '"]').attr('page-title');
            pageTitle = typeof pageTitle !== 'undefined' ? pageTitle : "";

            console.log('bodyClasses: ' + bodyClasses);

            exported = {
                stateID: thisStateID,
                templateName: templateNameSpace,
                pageName: pageName,
                pageTitle: pageTitle,
                colourScheme: colourScheme,
                fontOption: fontOption,
                bodyClasses: bodyClasses,
                layoutMap: stateMap,
                masterHtml: stateHTML,
            }

            exportString = JSON.stringify(exported);
            zip.file(convertToSlug(pageName) + '-' + time.getTime() + ".page", exportString);
        });

        zip.file(templateNameSpace + ".navs", $('#custom-nav-bank-mrv').html());
        zip.file(templateNameSpace + ".footers", $('#custom-footer-bank-mrv').html());

        if (stateID != "all") {
            zipName = convertToSlug(pageName);
        }
        blob = zip.generate({
            type: "blob",
            compression: "deflate"
        });
        saveAs(blob, zipName + ".variant");
    }

    function importState(bin, loadNow) {

        console.log('type of bin in importState: ' + typeof bin);
        //console.log('type of bin.target.files in importState: '+typeof bin.target.files);

        var files = typeof bin.target != "undefined" ? bin.target.files : bin,
            stateToLoadNow = "",
            loadNow = typeof(loadNow !== "undefined") && (loadNow == true) ? true : false;
        for (var i = 0, f; f = files[i]; i++) {

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    try {

                        var zip = new JSZip(e.target.result),
                            fileNamesHead = "<span class=\"variant-title-mrv\">Imported the following:</span>";
                        excludedHead = "<span class=\"variant-title-mrv\">Excluded these:</span>";
                        fileNames = "<ul>"
                        excluded = "<ul>"


                        // that, or a good ol' for(var entryName in zip.files)
                        $.each(zip.files, function(index, zipEntry) {
                            var navs, footer, page;
                            if (zipEntry.name == templateNameSpace + '.navs') {
                                navs = zipEntry.asText().trim();
                                navs = $('<div id="variant-temp-navs-mrv" />').html(navs);
                                $(navs).find('nav').each(function() {
                                    // If the current environment does not have a nav in the custom-nav-bank-mrv with this variant-custom-nav-mrv attribute/id then...
                                    if (!$('#custom-nav-bank-mrv [variant-custom-nav-mrv="' + $(this).attr('variant-custom-nav-mrv') + '"]').length) {
                                        addNavToList($(this));
                                        $('#custom-nav-bank-mrv').append($(this));
                                        $.localStorage(templateNameSpace + '.custom-navs-mrv', $('#custom-nav-bank-mrv').html());
                                        fileNames += "<li>Nav - " + $(this).attr('variant-nav-name-mrv') + "</li>";
                                    } else {
                                        excluded += "<li>Nav - " + $(this).attr('variant-nav-name-mrv') + " (already exists)</li>";
                                    }
                                });
                            } else if (zipEntry.name == templateNameSpace + '.footers') {
                                footers = zipEntry.asText().trim();
                                footers = $('<div id="variant-temp-footers-mrv" />').html(footers);
                                $(footers).find('footer').each(function() {
                                    // If the current environment does not have a footer in the custom-footer-bank-mrv with this variant-custom-footer-mrv attribute/id then...
                                    if (!$('#custom-footer-bank-mrv [variant-custom-footer-mrv="' + $(this).attr('variant-custom-footer-mrv') + '"]').length) {
                                        addFooterToList($(this));
                                        $('#custom-footer-bank-mrv').append($(this));
                                        $.localStorage(templateNameSpace + '.custom-footers', $('#custom-footer-bank-mrv').html());
                                        fileNames += "<li>Footer - " + $(this).attr('variant-footer-name') + "</li>";
                                    } else {
                                        excluded += "<li>Footer - " + $(this).attr('variant-footer-name') + " (already exists)</li>";
                                    }
                                });
                            } else {
                                page = JSON.parse(zipEntry.asText());
                                if (page.templateName == templateNameSpace) {
                                    if (!$('#state-bank-mrv [variant-saved-state-mrv="' + page.stateID + '"]').length) {
                                        fileNames += "<li>Page - " + page.pageName + "</li>";

                                        stateID = page.stateID;
                                        $('#state-bank-mrv').append('<li class="variant-saved-state-mrv" variant-saved-state-mrv="' + page.stateID + '" variant-state-name-mrv="' + page.pageName + '" page-title="' + page.pageTitle + '"></li>');
                                        addPageToList(page.pageName, page.stateID);

                                        $.localStorage(templateNameSpace + '.state.master-html-mrv.' + stateID, page.masterHtml);
                                        $.localStorage(templateNameSpace + '.state.layout-map-mrv.' + stateID, page.layoutMap);
                                        $.localStorage(templateNameSpace + '.state.colour-scheme-mrv.' + stateID, page.colourScheme);
                                        $.localStorage(templateNameSpace + '.state.font-option-mrv.' + stateID, page.fontOption);
                                        $.localStorage(templateNameSpace + '.state.body-classes-mrv.' + stateID, page.bodyClasses);
                                    } else {
                                        excluded += "<li>Page - " + page.pageName + " (already exists)</li>";
                                    }
                                } else {
                                    excluded += "<li>Page - " + page.pageName + " (not designed for this template)</li>";
                                }
                                stateToLoadNow = {
                                    "id": page.stateID,
                                    "name": page.pageName
                                };
                            }
                        });
                        $.localStorage(templateNameSpace + '.state.state-bank-mrv', $('#state-bank-mrv').html());

                        fileNames += "</ul>";
                        excluded += "</ul>";

                        // If we got to this point and the fileNames/exclusions lists are not empty, prepend the header
                        // They are shown anyway, so a blank list will be shown without a header if the list is empty
                        if (fileNames != "<ul></ul>") {
                            fileNames = fileNamesHead + fileNames;
                        }
                        if (excluded != "<ul></ul>") {
                            excluded = excludedHead + excluded;
                        }

                        if (loadNow) {
                            console.log('Auto loading state: ' + stateToLoadNow.id);
                            $('.startup-button-mrv').remove();
                            loadState(stateToLoadNow.id, stateToLoadNow.name);
                        } else {
                            variantAlert('Import', fileNames + '<br />' + excluded);
                        }

                        setTimeout(function() {
                            if ($('.saved-pages-holder-mrv').find('.load-page-button-mrv').length) {
                                $('.saved-pages-holder-mrv').removeClass('empty-saved-pages-holder-mrv');
                            } else {
                                $('.saved-pages-holder-mrv').addClass('empty-saved-pages-holder-mrv');
                            }
                        }, 100);

                        // end of the magic !

                    } catch (e) {
                        variantAlert("Page Import Error", "Error reading " + theFile.name + " : <br /><br />" + e.message);
                    }
                }
                $result.append($fileContent);

            })(f);

            // read the file !
            // readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
            reader.readAsArrayBuffer(f);
            // reader.readAsBinaryString(f);
        }
        //End of files For loop

        //Reset the file input box back to empty so that it can accept the next file user selects.
        $('.import-page-files-mrv').val("");
    }

    function localStorageSpace() {
        var allStrings = '',
            key;
        for (key in window.localStorage) {
            if (window.localStorage.hasOwnProperty(key)) {
                allStrings += window.localStorage[key];

            }
        }
        return allStrings ? 3 + ((allStrings.length * 16) / (8 * 1024)) + ' KB' : 'Empty (0 KB)';
    }

    function loadStateBank() {
        $('#state-bank-mrv').html($.localStorage(templateNameSpace + '.state.state-bank-mrv'));
        $('#state-bank-mrv li').each(function() {
            addPageToList($(this).attr('variant-state-name-mrv'), $(this).attr('variant-saved-state-mrv'));
        });
    }

    function makeModalsDraggable() {
        $("#simplemodal-container").draggable({
            handle: ".modal-title-mrv"
        });
    }

    function makeSortable() {

        $('.variant-page-mrv section, .variant-page-mrv header, .variant-page-mrv footer').each(function() {
            var thisSection = '.' + $(this).attr('variant-editable-mrv');
            $(this).find('div.row, .variant-sortable-mrv').not('.masonry').sortable({
                items: "> div:not('.variant-molecule-mrv')",
                cancel: "[contenteditable], nav, input, textarea, .icon-buttons-wrapper-mrv",
                scroll: true,
                opacity: 1,
                zIndex: 999999,
                forcePlaceholderSize: true,
                forceHelperSize: false,
                cursor: "move",
                connectWith: thisSection + " div.row, " + thisSection + " .variant-sortable-mrv",
                helper: function(e, tr) {
                    var $originals = tr.children(),
                        $helper = tr.clone();
                    $helper.children().each(function(index) {
                        $(this).width($originals.eq(index).width());
                    });
                    $helper.css('box-shadow', '0px 7px 30px 0px rgba(50, 50, 50, 0.5)');
                    $helper.removeClass('hovered-on-mrv').css('border', 'none !important');
                    return $helper;
                },
                appendTo: ".variant-page-mrv",
                placeholder: "variant-sortable-placeholder-mrv",
                tolerance: "pointer",
                revert: "300",
                update: function(event, ui) {
                    var elementID, nextID, element, parent;
                    elementID = ui.item.attr('variant-editable-mrv');
                    element = ui.item;
                    nextID = $('.variant-page-mrv .' + elementID).next().attr('variant-editable-mrv');
                    parentID = ui.item.parent().attr('variant-editable-mrv');
                    parent = ui.item.parent();

                    if (ui.item.is(':last-child')) {
                        $('#master-html-mrv .' + elementID).detach().appendTo('#master-html-mrv .' + parentID);
                    } else {
                        $('#master-html-mrv .' + elementID).detach().insertBefore('#master-html-mrv .' + nextID);
                    }
                    saveState();
                },
                start: function(e, ui) {
                    /*    var $originals = ui.item.children();
		                    
		                    $ui.placeholder.children().each(function(index){
							    $(this).width($originals.eq(index).width());
							});
							ui.helper.css('box-shadow', '0px 7px 30px 0px rgba(50, 50, 50, 0.5)');
							ui.helper.removeClass('hovered-on-mrv').css('border','none !important'); */
                },
            });
        }); // End each section, header, footer

        $('.variant-page-mrv table > tbody').each(function() {
            var thisSection = '.' + $(this).attr('variant-editable-mrv');

            $(this).sortable({
                items: " > tr",
                cancel: "[contenteditable], .icon-buttons-wrapper-mrv",
                scroll: true,
                opacity: 1,
                zIndex: 999999,
                forcePlaceholderSize: true,
                forceHelperSize: false,
                cursor: "move",
                connectWith: thisSection,
                helper: function(e, tr) {
                    var tableWrap = tr.closest('table').clone(),
                        $originals = tr.children(),
                        $helper = tr.clone();

                    $helper.children().each(function(index) {
                        $(this).width($originals.eq(index).width());
                    });

                    $helper.css('box-shadow', '0px 7px 30px 0px rgba(50, 50, 50, 0.5)')
                        .removeClass('hovered-on-mrv')
                        .addClass('no-transition-mrv')
                        .css('border', 'none !important')
                        .css('transition: all 0s ease !important');

                    return $helper;
                },
                appendTo: "parent",
                placeholder: "",
                tolerance: "pointer",
                revert: "100",
                update: function(event, ui) {
                    var elementID, nextID, element, parent;
                    elementID = ui.item.attr('variant-editable-mrv');
                    element = ui.item;
                    nextID = $('.variant-page-mrv .' + elementID).next().attr('variant-editable-mrv');
                    parentID = ui.item.parent().attr('variant-editable-mrv');
                    parent = ui.item.parent();

                    if (ui.item.is(':last-child')) {
                        $('#master-html-mrv .' + elementID).detach().appendTo('#master-html-mrv .' + parentID);
                    } else {
                        $('#master-html-mrv .' + elementID).detach().insertBefore('#master-html-mrv .' + nextID);
                    }
                    saveState();
                },
                start: function(e, ui) {
                    console.log(ui.placeholder);
                    ui.placeholder.children().each(function() {
                        console.log(this);
                    });
                    ui.placeholder.appendTo(ui.placeholder.parent().parent());
                    //ui.placeholder.width(ui.placeholder.parent().width());
                    //ui.placeholder.children().each(function(index){
                    //    $(this).width($originals.eq(index).outerWidth(true));
                    //});
                },
            });
        }); // End table tbody

        $('.variant-page-mrv nav').each(function() {
            var thisSection = '.' + $(this).attr('variant-editable-mrv');
            $(this).find('.variant-sortable-mrv').sortable({
                items: "> li",
                cancel: "[contenteditable], .subnav li, .icon-buttons-wrapper-mrv",
                scroll: true,
                opacity: 1,
                zIndex: 999999,
                forcePlaceholderSize: true,
                forceHelperSize: true,
                cursor: "move",
                //connectWith			:	thisSection+" div.row, "+thisSection+" .variant-sortable-mrv",
                helper: "clone",
                appendTo: ".variant-page-mrv nav:first",
                placeholder: "variant-sortable-placeholder-mrv",
                tolerance: "pointer",
                revert: "300",
                update: function(event, ui) {
                    var elementID, nextID, element, parent;
                    elementID = ui.item.attr('variant-editable-mrv');
                    element = ui.item;
                    nextID = $('.variant-page-mrv .' + elementID).next().attr('variant-editable-mrv');
                    parentID = ui.item.parent().attr('variant-editable-mrv');
                    parent = ui.item.parent();

                    if (ui.item.is(':last-child')) {
                        $('#master-html-mrv .' + elementID).detach().appendTo('#master-html-mrv .' + parentID);
                    } else {
                        $('#master-html-mrv .' + elementID).detach().insertBefore('#master-html-mrv .' + nextID);
                    }
                    saveState();
                },
                start: function(event, ui) {
                    ui.helper.css('box-shadow', '0px 7px 30px 0px rgba(50, 50, 50, 0.5)');
                    ui.helper.removeClass('hovered-on-mrv').css('border', 'none !important');
                },
            });
        }); // End each section, header, footer

    }

    function makeLayoutMapSortable() {
        $('.layout-map-mrv').sortable({
            items: '> .added-section-mrv',
            revert: false,
            cursor: "move",
            opacity: 0.7,
            delay: 150,
            cancel: '[contenteditable]',
            update: function() {
                updateOrder();
            }
        });
    }

    function loadColourSchemes() {
        console.groupCollapsed('Loading Colour Schemes');
        var colourSchemes;

        try {
            colourSchemes = JSON.parse($('.colour-schemes-mrv').html());
            $('.style-switcher-mrv').eq(2).removeClass('variant-hidden-mrv');
            addColourScheme('Original', colourSchemes.original.colours, 'theme');
            $('.colour-schemes-list-mrv').attr('variant-original-css-mrv', colourSchemes.original.originalFileName + '.css').attr('variant-current-css-mrv', colourSchemes.original.originalFileName + '.css');
            $(colourSchemes.schemes).each(function() {
                addColourScheme(this.name, this.colours, 'theme-' + this.name);
                console.log('Preloading colour scheme: theme-' + this.name.toLowerCase());
                preloadColourScheme('theme-' + this.name.toLowerCase() + '.css');
            });
            $('.variant-preload-stylesheet-mrv').remove();
            $('.page-style-options-mrv').removeClass('empty-sidebar-panel-mrv');
        } catch (err) {
            console.log('Error parsing colour scheme JSON. ' + err.message);
            return;
        }

        console.log('Loaded ' + colourSchemes.schemes.length + ' colour schemes.');
        console.groupEnd();
    }

    function loadFonts() {

        var fontOptions, fontSwitcher;

        try {
            fontOptions = JSON.parse($('.variant-font-options-mrv').html());
            $('.variant-font-switcher-mrv').removeClass('variant-hidden-mrv');
            $('.variant-font-switcher-title-mrv').text(fontOptions.title);
            addFontSet(fontOptions.originalSet);
            $(fontOptions.optionalSets).each(function() {
                addFontSet(this);
            });
            $('.page-style-options-mrv').removeClass('empty-sidebar-panel-mrv');
        } catch (err) {
            console.log('Error parsing font options JSON. ' + err.message);
            return;
        }

        console.log('Loaded ' + fontOptions.optionalSets.length + ' font options.');
    }

    function addColourScheme(name, colours, css) {
        var schemeColoursLi, schemeColours = "",
            liTitle = name + ": ",
            percentage = (100 / colours.length);
        $(colours).each(function(index, colour) {
            schemeColours += '<div class="colour-block-mrv" style="width: ' + percentage + '%; background-color: ' + colour + '"></div>';
            liTitle += ' ' + colour;
        });

        schemeColoursLi = '<li title="' + liTitle + '" class="variant-colour-scheme-mrv" variant-scheme-css-mrv="' + css.toLowerCase() + '.css">';
        $('.colour-schemes-list-mrv').append(schemeColoursLi + schemeColours + '</li>');
    }

    function addFontSet(fontSet) {
        var fontOption = $('<li>').addClass('variant-font-set-mrv')
            .attr('variant-font-set-name-mrv', fontSet.setName);
        if (fontSet.css.length > 0) {
            fontOption.attr('variant-font-css-mrv', fontSet.css);
        } else {
            fontOption.attr('variant-font-css-mrv', 'variant-original-mrv');
        }

        $(fontSet.fonts).each(function() {
            fontOption.append($('<img>').attr('src', 'img/fonts/' + convertToSlug(this.fontName) + '.png'));
        });
        $('.variant-font-options-list-mrv').append(fontOption);
    }

    function switchColourScheme(css, save) {
        try {
            colourSchemes = JSON.parse($('.colour-schemes-mrv').html());
            console.log('Attempting switch colour scheme to: ' + css);
            var replacementCss = css,
                existingHref = $('[href*="' + $('.colour-schemes-list-mrv').attr('variant-current-css-mrv') + '"]').attr('href'),
                cssToReplace = $('.colour-schemes-list-mrv').attr('variant-current-css-mrv');
            replacementCss = existingHref.replace(cssToReplace, replacementCss);

            $('[href*="' + $('.colour-schemes-list-mrv').attr('variant-current-css-mrv') + '"]').attr('href', replacementCss);

            // Update current to be used next time a replacement is needed
            $('.colour-schemes-list-mrv').attr('variant-current-css-mrv', css);

            // SwitchColourScheme should not save state unless necessary because it could be called before page finishes loading,
            // which sets an empty last state, breaking the "Load Last Page" option.
            if (save == true) {
                saveState();
            }
        } catch (err) {
            console.log('Colour Schemes JSON error: ' + err.message);
        }
    }

    function switchFont(setName, save) {
        try {
            console.log('Attempting font switch to: ' + setName);
            var fontOptions = JSON.parse($('.variant-font-options-mrv').html()),
                css = $('[variant-font-set-name-mrv=' + setName + ']').attr('variant-font-css-mrv');


            $('head link.variant-optional-font-mrv').remove();
            $('head').append('<link class="variant-optional-font-mrv" href="' + css + '" rel="stylesheet" type="text/css">')
                .append('<link class="variant-optional-font-mrv" href="../css/font-' + convertToSlug(setName) + '.css" rel="stylesheet" type="text/css">');

            // Update current to be used next time a replacement is needed
            $('.variant-font-options-list-mrv').attr('variant-current-font-mrv', setName);

            // SwitchColourScheme should not save state unless necessary because it could be called before page finishes loading,
            // which sets an empty last state, breaking the "Load Last Page" option.
            if (save == true) {
                saveState();
            }
        } catch (err) {
            console.log('switchFont Error: ' + err.message);
        }
    }

    function preloadColourScheme(css) {
        $('head').append('<link class="variant-preload-stylesheet-mrv" href="theme/css/' + css + '" rel="alternate stylesheet" type="text/css" media="all">');
    }

    function disableLinks() {
        $('.variant-disable-link-mrv').unbind('click').click(function() {
            return false;
        });
    }

    function loadOptionalBodyClasses() {
        try {

            var optionalBodyClasses = JSON.parse($('#variant-body-classes-mrv').html()),
                bodyOptions = $('<div>').addClass('options-switcher-mrv')
                .append('<div class="sidebar-section-title-mrv"><span>Page Options</span></div>')
                .append('<div class="sidebar-panel-mrv"><ul class="variant-body-options-mrv"></ul></div>')
                .appendTo('.sidebar-styles-mrv');

            if ($.isArray(optionalBodyClasses.options)) {
                $(optionalBodyClasses.options).each(function() {
                    // addClassOption(optionalClass, appendTarget, classTarget, initialise)
                    addClassOption(this, '.variant-body-options-mrv', 'body, #variant-body-classes-mrv', true);
                });
            } else {
                addClassOption(optionalBodyClasses.options, '.variant-body-options-mrv', 'body, #variant-body-classes-mrv', true);
            }
        } catch (err) {
            console.log('Error parsing body class options JSON. ' + err.message);
            return;
        }
    }

    function loadOptionalNavClasses(navID) {

        if (!arguments.length) {
            navID = $('#master-html-mrv nav').attr('nav-id');
        }

        $('.variant-nav-options-mrv').closest('.options-switcher-mrv').remove();

        try {

            var optionalNavClasses = JSON.parse($('#' + navID + ' script.options').html()),
                navOptions = $('<div>').addClass('options-switcher-mrv')
                .append('<div class="sidebar-section-title-mrv"><span>Nav Options</span></div>')
                .append('<div class="sidebar-panel-mrv"><ul class="variant-nav-options-mrv"></ul></div>')
                .appendTo('.sidebar-styles-mrv');

            if ($.isArray(optionalNavClasses.options)) {
                $(optionalNavClasses.options).each(function() {
                    // addClassOption(optionalClass, appendTarget, classTarget, initialise)
                    addClassOption(this, '.variant-nav-options-mrv', mrv_pageNavTarget.selector + ' nav, ' + mrv_masterNavTarget.selector + ' nav', true);
                });
            } else {
                addClassOption(optionalNavClasses.options, '.variant-nav-options-mrv', mrv_pageNavTarget.selector + ' nav, ' + mrv_masterNavTarget.selector + ' nav', true);
            }
        } catch (err) {
            console.log('Error parsing nav class options JSON. ' + err.message);
            return;
        }
    }

    function loadOptionalELementClasses() {
        try {
            return JSON.parse($('#variant-element-classes-mrv').html());
        } catch (err) {
            console.log('Error parsing element class options JSON. ' + err.message);
            return JSON.parse('{"options":[]}');
        }
    }

    function getOptionalElementClasses(el, show) {
        var element = $('.' + el),
            menu = "",
            selector, show = show;

        elementOptionalClasses.options.forEach(function(option) {

            // selector is used to see if this option needs to be shown.  
            // A disposable selector is used if the class hasbeen added to the element for the sole purpose of showing an option.
            // The disposable selector is in the options list so that it can picked up and removed from the output.
            // selector uses the disposableSelector first and falls back to plain selector.
            selector = option.disposableSelector || option.selector;

            // Check if there is a closest specified then change element to that closest one by selector of this.closest.
            if (typeof option.closest !== "undefined") {
                element = $('.' + $(element).closest(option.closest).attr('variant-editable-mrv'));
            }

            if (typeof option.menu !== "undefined") {
                menu = '.' + option.menu;
            }

            if ($(element).is(selector)) {
                addClassOption(option, '.element-context-options-mrv' + menu, element.selector, true);
                if ((typeof show !== "undefined") && (show == true)) {
                    $('.element-context-options-mrv' + menu).removeClass('variant-hidden-mrv');
                }

            }
        });
    }

    function loadOptionalELementAttributes() {
        try {
            return JSON.parse($('#variant-element-attributes-mrv').html());
        } catch (err) {
            console.log('Error parsing element attribute options JSON. ' + err.message);
            return JSON.parse('{"options":[]}');
        }
    }

    function getOptionalElementAttributes(el) {
        var element = $('.' + el);
        $('ul.element-context-options-mrv li').remove();
        $(elementOptionalAttributes.options).each(function() {
            if (element.is(this.selector)) {
                prepareCustomOption(element, this);
            }
        });
    }

    // This is called when mouse hovers into a section, header or footer in the page - corner control menus are repopulated each time.
    function populateSectionControls(section) {

        var optionalClassCount = 0,
            optionalAttributeCount = 0,
            variantOptionCount = 0,
            jSection = $('.variant-page-mrv .' + section),
            thisSection = jSection.attr('variant-editable-mrv'),
            position = jSection.position(),
            offset = jSection.offset(),
            navHeight = Math.max($('.variant-page-mrv nav:nth-of-type(1)').outerHeight(true), $('.variant-page-mrv .nav-container:nth-of-type(1)').outerHeight(true)),
            navPosition = $('.variant-page-mrv nav').css('position'),
            page = $('.variant-page-mrv'),
            sectionWidth = jSection.width(),
            windowWidth = $(window).width(),
            controlContainerWidth = 0,
            controlContainerLeft = Math.round((sectionWidth + (windowWidth - sectionWidth) / 2) + 14),
            sectionControlsContainer, sectionCogList, attributeButton, backgroundImage, video;


        // Create, populate and append top-right controls to the section:
        if (!$.find('.variant-page-mrv .section-controls-top-right-mrv[variant-controls-for-mrv="' + thisSection + '"]').length) {

            $('.variant-page-mrv .section-controls-top-right-mrv').remove();
            sectionControlsContainer = $('<div class="section-controls-top-right-mrv" />');
            if (!jSection.is(':first-child') && (navPosition == "absolute" || navPosition == "fixed")) {
                navHeight = 0;
            }
            sectionControlsContainer.css('top', (Math.round(position.top + 10 + navHeight)));
            sectionControlsContainer.attr('variant-controls-for-mrv', thisSection);
            sectionCogList = $('<ul></ul>');
            sectionCogList.append('<li class="variant-section-control-mrv"><span class="variant-section-control-button-mrv oi" data-glyph="cog"></span><ul class="element-context-options-mrv utility"></ul></li>');

            // Test For element options
            elementOptionalClasses.options.forEach(function(option) {
                if (jSection.is(option.selector)) {
                    optionalClassCount++;
                }
            });

            // Only put a cog in the section controls if there are applicable options
            if (optionalClassCount > 0) {

            }

            // Append section attribute options
            elementOptionalAttributes.options.forEach(function(option) {
                if ((jSection.find(option.selector).length === 1) && (option.sectionControl == "true")) {

                    // Set appendTarget false to receive the button rather than having it appended elsewhere.
                    attributeButton = addAttributeOption(option, false, jSection.find(option.selector).first().attr('variant-editable-mrv'));
                    sectionCogList.append(attributeButton);
                    controlContainerLeft -= 48;
                    controlContainerWidth += 48;
                    optionalAttributeCount++;
                }
            });

            // Append section Background Image options
            // Background-image-holder images
            backgroundImage = jSection.find('.background-image-holder > img:not(.lightbox-gallery-mrv img, .variant-molecule-mrv img ,ul.slides .background-image-holder > img):first');
            if (backgroundImage.length == 1) {

                // NOTE addEditImageButton(imageTarget = variant-editable id of img, appendTarget = false returns the button here);
                sectionCogList.append(addEditImageButton(backgroundImage.attr('variant-editable-mrv'), false));
                controlContainerLeft -= 48;
                controlContainerWidth += 48;
                variantOptionCount++;
            }

            if (jSection.find('img').length == 1) {
                // If only one plain img
                if (jSection.find('img:not(.background-image-holder > img, ul.slides > li img)').length == 1) {

                    // NOTE addEditImageButton(imageTarget = variant-editable id of img, appendTarget = false returns the button here);
                    sectionCogList.append(addEditImageButton(jSection.find('img:not(.background-image-holder > img, ul.slides > li img):first').attr('variant-editable-mrv'), false));
                    controlContainerLeft -= 48;
                    controlContainerWidth += 48;
                    variantOptionCount++;
                } else {
                    // There are more than one plain img - give each a button.
                    backgroundImage = jSection.find('img:not(.background-image-holder > img, ul.slides > li img)').each(function() {
                        if ((!$(this).parent().is('.background-image-holder')) && ($(this).css('position') == "absolute") && (!$(this).hasClass('variant-deleted-mrv'))) {

                            // NOTE addEditImageButton(imageTarget = variant-editable id of img, appendTarget = false returns the button here);
                            sectionCogList.append(addEditImageButton($(this).attr('variant-editable-mrv'), false));
                            controlContainerLeft -= 48;
                            controlContainerWidth += 48;
                            variantOptionCount++;
                        }
                    });

                }
            }

            if (jSection.find('video').length === 1) {
                video = jSection.find('video');
                // NOTE addEditImageButton(imageTarget = variant-editable id of img, appendTarget = false returns the button here);
                sectionCogList.append(addEditVideoButton(video.attr('variant-editable-mrv'), false));
                controlContainerLeft -= 48;
                controlContainerWidth += 48;
                variantOptionCount++;
            }


            if (optionalClassCount + optionalAttributeCount > 0) {
                sectionControlsContainer.append(sectionCogList);
                controlContainerLeft -= 48;
                controlContainerWidth += 48;
            }

            if (optionalClassCount + optionalAttributeCount + variantOptionCount > 0) {

                sectionControlsContainer.css('width', controlContainerWidth).css('left', controlContainerLeft).attr('data-left', controlContainerLeft);

                sectionControlsContainer.addClass('variant-section-control-group-mrv').appendTo(page);

                getOptionalElementClasses(section);
            }
        }

    }

    function addAttributeOption(option, appendTarget, attributeTarget) {
        var button, icon = option.modalInputIcon || "pencil";

        button = $('<li />');
        button.addClass('variant-attribute-option-button-mrv');
        button.append('<span class="oi" data-glyph="' + icon + '"></span><span class="variant-attribute-button-text-mrv">' + option.buttonText + '</span>');
        button.data('variant-attribute-option-mrv', option);
        button.attr('attribute-option-target-mrv', attributeTarget);
        button.attr('title', option.buttonText);

        // If append target is false, return the button instead of appending it.
        if (appendTarget === false) {
            return button;
        } else {
            $(appendTarget).append(button);
        }

    }

    function addClassOption(optionalClass, appendTarget, classTarget, initialise) {

        var setInitial = typeof initialise !== 'undefined' ? initialise : false,
            classTarget = typeof classTarget !== 'undefined' ? classTarget : false,
            initialState = (optionalClass.initial == 'on' ? 'on' : 'off'),
            newOption = $('<li>'),
            newSwitch = $('<div>'),
            state = "",
            refresh;

        refresh = ((typeof optionalClass.refresh !== "undefined") && (optionalClass.refresh == "true")) ? "refresh" : "";



        newOption.addClass('variant-custom-option-mrv');

        if (optionalClass.title) {
            newOption.append('<span>' + optionalClass.title + '</span>');
        }

        if (optionalClass.type == "choice") {
            if (initialState == 'on' && setInitial == true) {
                $(classTarget).addClass(optionalClass.class);
            }
            newSwitch.addClass('class-choice-mrv').attr('optionalclass', optionalClass.class).attr('classtarget', classTarget);
            newSwitch.append('<div class="class-choice-button-mrv choice-button-on ' + refresh + ' ' + ((initialState == 'on' && setInitial === true) ? 'choice-active-mrv' : '') + (($(classTarget).hasClass(optionalClass.class) && setInitial !== true) ? 'choice-active-mrv' : '') + '">' + optionalClass.onText + '</div>');
            newSwitch.append('<div class="class-choice-button-mrv choice-button-off ' + refresh + ' ' + ((initialState == 'off' && setInitial === true) ? 'choice-active-mrv' : '') + ((!$(classTarget).hasClass(optionalClass.class) && setInitial !== true) ? 'choice-active-mrv' : '') + '">' + optionalClass.offText + '</div>');
            newOption.append(newSwitch);

        }

        if (optionalClass.type == "toggle") {

            if (initialState == 'on' && setInitial == true) {
                $(classtarget).addClass(optionalClass.class);
            }

            // If initialState is forced on by setInitial === true, then state becomes active. 
            state = (initialState == 'on' && setInitial === true) ? ' toggle-active-mrv' : '';
            // If the initial class setting is then found to be auto, check for existence of optionalClass on 
            // the classTarget and set state active, else leave as it was.
            state = (optionalClass.initial === 'auto' && $(classTarget).hasClass(optionalClass.class)) ? ' toggle-active-mrv' : state;
            newSwitch.addClass('class-toggle-mrv').attr('optionalclass', optionalClass.class).attr('classtarget', classTarget);
            newSwitch.append('<span class="oi" data-glyph="' + optionalClass.icon + '"></span><span>' + optionalClass.text + '</span>');
            newSwitch.append('<div class="class-toggle-switch-mrv' + state + ' ' + refresh + '"><div class="class-toggle-handle-mrv"></div></div>');
            newOption.append(newSwitch);

        }

        if (optionalClass.type == "multi") {

            newSwitch.addClass('class-multi-mrv').attr('classtarget', classTarget);
            $.each(optionalClass.classes, function(index, thisClass) {
                newSwitch.append('<div class="class-multi-button-mrv ' + refresh + ' ' + (((optionalClass.initial == (index + 1)) && (setInitial === true)) ? 'multi-active-mrv' : '') + '" optionalclass="' + (thisClass.class !== "" ? thisClass.class : " ") + '">' + thisClass.text + '</div>');
            });
            newOption.append(newSwitch);

        }

        // If a submenu has been specified we need to add one after checking that it does not already exist.
        if (typeof optionalClass.submenu !== "undefined") {
            // If a submenu of the same name doesn't already exist then add one.
            if (!$(appendTarget).find('li.variant-submenu-mrv[submenu-name="' + optionalClass.submenu + '"]').length) {
                $(appendTarget).append('<li class="variant-submenu-mrv" submenu-name="' + optionalClass.submenu + '"><span class="variant-submenu-header-mrv">' + optionalClass.submenu + '</span><ul></ul></li>');
            }
            appendTarget = $(appendTarget).find('li.variant-submenu-mrv[submenu-name="' + optionalClass.submenu + '"] ul');
        }

        // If append target is false, return the button instead of appending it.
        if (appendTarget === false) {
            return newOption;
        } else {
            $(appendTarget).append(newOption);
        }


    }

    function addEditImageButton(imageTarget, appendTarget) {
        var jAppendTarget = $('.variant-page-mrv .' + appendTarget),
            editImageButton, sectionControls, jAppendTargetParent, imageWidth = jAppendTarget.width(),
            iconButtonsPadding = "10px";

        editImageButton = createIconButton('image', 'Edit Image');
        $(editImageButton).unbind('click').bind('click', function(e) {
            promptEditImage($('.' + imageTarget).attr('variant-editable-mrv'));
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.returnValue = false;
            return false;
        }).attr('icon-button-for-mrv', $('.' + imageTarget).attr('variant-editable-mrv'));

        // Sometimes the button on a small image looks strange, 
        // so if image is less than 100px wide, change padding from 10px to 2px.

        if (imageWidth <= 100) {
            iconButtonsPadding = "2px";
        }

        if (appendTarget !== false) {

            if (jAppendTarget.prop('tagName').toLowerCase() == "img") {

                if (jAppendTarget.css('position') == "absolute") {
                    return true;
                }
                jAppendTargetParent = jAppendTarget.parent();
                if (!jAppendTarget.parent().is('.variant-image-wrapper-mrv')) {

                    // Wrap the image in a div
                    jAppendTarget.wrap('<div class="variant-image-wrapper-mrv"></div>');
                    jAppendTargetParent = jAppendTarget.parent();
                    // Attempt to overcome some image positioning issues
                    if (jAppendTarget.css('float') !== "") {
                        jAppendTargetParent.css('float', jAppendTarget.css('float'));
                    }

                    if (jAppendTarget.css('margin-right') !== "") {
                        jAppendTargetParent.css('margin-right', jAppendTarget.css('margin-right'));
                        jAppendTarget.css('margin-right', '0px');
                    }
                    if (jAppendTarget.css('margin-left') !== "") {
                        jAppendTargetParent.css('margin-left', jAppendTarget.css('margin-left'));
                        jAppendTarget.css('margin-left', '0px');
                    }
                    if (jAppendTarget.hasClass('pull-right')) {
                        jAppendTargetParent.addClass('pull-right');
                    }
                    if (jAppendTarget.hasClass('pull-left')) {
                        jAppendTargetParent.addClass('pull-left');
                    }
                    //jAppendTargetParent.css('min-width', jAppendTarget.css('min-width'));
                    jAppendTargetParent.css('max-width', imageWidth);
                    //jAppendTarget.css('width', '100%').css('min-width', '100%');
                }

                jAppendTargetParent.append('<div class="icon-buttons-wrapper-mrv"></div>');
                jAppendTargetParent.find('.icon-buttons-wrapper-mrv').css('padding', iconButtonsPadding).append(editImageButton);

                return true;
            } else {
                jAppendTarget.append('<div class="icon-buttons-wrapper-mrv"></div>');
                jAppendTarget.find('.icon-buttons-wrapper-mrv').css('padding', iconButtonsPadding).append(editImageButton);
            }
        }
        // If append target is false, return the button instead of appending it.
        if (appendTarget === false) {
            return editImageButton;
        }
    }

    function addEditVideoButton(videoTarget, appendTarget) {
        var jAppendTarget = $('.variant-page-mrv .' + appendTarget),
            editVideoButton, sectionControls, jAppendTargetParent, videoWidth = jAppendTarget.width(),
            iconButtonsPadding = "10px";

        editVideoButton = createIconButton('video', 'Edit Video');
        $(editVideoButton).unbind('click').bind('click', function(e) {
            promptEditVideo($('.' + videoTarget).attr('variant-editable-mrv'));
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.returnValue = false;
            return false;
        }).attr('icon-button-for-mrv', $('.' + videoTarget).attr('variant-editable-mrv'));

        // If append target is false, return the button instead of appending it.
        if (appendTarget === false) {
            return editVideoButton;
        }
    }

    function addSliderButtons(slider) {
        console.log('The nav is: ' + $('.variant-page-mrv nav').css('position'));
        var jSlider = $('.variant-page-mrv ul.slides.' + slider),
            navPosition = $('.variant-page-mrv nav').css('position');
        numSlides = 0,
            offsetTop = 0;

        // Absolute (transparent) navs dont push into the flow, and overlay the first section, so anything dynamically added needs
        // to be spaced off the top by the same height as the .absolute nav

        if ((navPosition == "absolute" || navPosition == "fixed") && jSlider.closest('section').is('.variant-page-mrv section:nth-of-type(1), .variant-page-mrv header:nth-of-type(1)')) {
            offsetTop = Math.max($('.variant-page-mrv nav').outerHeight(true), $('.variant-page-mrv .nav-container').outerHeight(true));
        }

        numSlides = jSlider.find(' > li').length;
        jSlider.find(' > li').each(function(index) {
            var jSlide = $(this),
                buttonWrapper, prevSlideButton = "",
                nextSlideButton = "",
                deleteSlideButton = "",
                cloneSlideButton, editImageButton = "",
                editVideoButton = "";

            buttonWrapper = $('<div class="icon-buttons-wrapper-mrv"></div>');

            // Add the standard padding to the offset to make the buttons append in the right spot beneath the menu.
            // 10 is the standard button padding at this time.
            buttonWrapper.css('padding-top', offsetTop + 10);

            // If no images are found in the whole slider it must be a text slider, therefore raise the buttons so as not to clash with text input
            if (!jSlider.find('img').length) {
                buttonWrapper.addClass('variant-avoid-text-mrv');
            }
            if (jSlider.find('li > p, li > span').length) {
                buttonWrapper.addClass('variant-avoid-text-mrv');
            }

            if (!jSlide.find('.round-icon-button-mrv').length) {
                console.log('No buttons found in this slide yet - adding them...');

                // Add clone and delete buttons first because every slide needs these
                // But only do it if there is more than one slide in the slider (no need for prev/next/delete if only one)
                if (numSlides > 1) {
                    prevSlideButton = createIconButton('arrow-thick-left', 'Show Previous Slide');
                    $(prevSlideButton).unbind('click').bind('click', function(e) {
                        jSlider.parent().flexslider("prev");
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                        e.returnValue = false;
                        return false;
                    });

                    nextSlideButton = createIconButton('arrow-thick-right', 'Show next Slide');
                    $(nextSlideButton).unbind('click').bind('click', function(e) {
                        jSlider.parent().flexslider("next");
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                        e.returnValue = false;
                        return false;
                    });

                    deleteSlideButton = createIconButton('minus', 'Delete Slide');
                    $(deleteSlideButton).unbind('click').bind('click', function(e) {
                        // Slider Item delete has "true" passed to deleteElement which removes the original element completely rather than trashing it.
                        deleteElement(jSlide.attr('variant-editable-mrv'), true);
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                        e.returnValue = false;
                        return false;
                    });
                }

                cloneSlideButton = createIconButton('plus', 'Clone Slide');
                $(cloneSlideButton).unbind('click').bind('click', function(e) {
                    cloneElement(jSlide.attr('variant-editable-mrv'));
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.returnValue = false;
                    return false;
                });

                if (jSlide.find(' > div.background-image-holder img').length) {
                    // Calling addEditImageButton with appendTarget set to false to have button returned.
                    editImageButton = addEditImageButton(jSlide.find(' > div.background-image-holder img').attr('variant-editable-mrv'), false);
                }
                if (jSlide.find('img').length == 1) {
                    // Calling addEditImageButton with appendTarget set to false to have button returned.
                    editImageButton = addEditImageButton(jSlide.find('img').attr('variant-editable-mrv'), false);
                }
                if (jSlide.find('video').length == 1) {
                    editVideoButton = addEditVideoButton(jSlide.find('video').attr('variant-editable-mrv'), false);
                }

                buttonWrapper.append(prevSlideButton).append(deleteSlideButton).append(editImageButton).append(editVideoButton).append(cloneSlideButton).append(nextSlideButton);
                jSlide.prepend(buttonWrapper);
            }
        });
    }

    function createIconButton(icon, titleText) {
        var iconString = (typeof icon !== 'undefined' ? icon : 'star'),
            button;
        button = $('<div data-glyph="' + icon + '" class="oi round-icon-button-mrv" title="' + titleText + '"></div>');
        return button;
    }

    function createAttributeButton(option, appendTarget, attributeTarget) {
        var button, icon = option.modalInputIcon || "pencil";

        button = $('<div data-glyph="' + icon + '" class="oi round-icon-button-mrv" title="' + option.buttonText + '"></div>');
        button.addClass('variant-attribute-option-button-mrv');
        button.data('variant-attribute-option-mrv', option);
        button.attr('attribute-option-target-mrv', attributeTarget);

        // If append target is false, return the button instead of appending it.
        if (appendTarget === false) {
            return button;
        } else {
            $(appendTarget).append(button);
        }
    }


    function applyBodyClasses(classes) {
        var classes = typeof classes !== 'undefined' ? classes : "";
        $('#variant-body-classes-mrv').removeAttr('class').addClass(classes);
        $('body').addClass(classes);

        $('.variant-body-options-mrv .class-choice-mrv').each(function() {
            $(this).find('.class-choice-button-mrv').removeClass('choice-active-mrv');
            if (classes.indexOf($(this).attr('optionalclass')) !== -1) {
                $(this).find('.choice-button-on').addClass('choice-active-mrv');
            } else {
                $(this).find('.choice-button-off').addClass('choice-active-mrv');
                $('body').removeClass($(this).attr('optionalclass'));
            }
        });

        $('.variant-body-options-mrv .class-toggle-mrv').each(function() {
            $(this).find('.class-toggle-switch-mrv').removeClass('toggle-active-mrv');
            if (classes.indexOf($(this).attr('optionalclass')) !== -1) {
                $(this).find('.class-toggle-switch-mrv').addClass('toggle-active-mrv');
            } else {
                $('body').removeClass($(this).attr('optionalclass'));
            }
        });


        $('.variant-body-options-mrv .class-multi-button-mrv').removeClass('multi-active-mrv');
        $('.variant-body-options-mrv .class-multi-button-mrv[optionalclass=" "]').addClass('multi-active-mrv');
        $('.variant-body-options-mrv .class-multi-button-mrv').each(function() {

            if ((classes.indexOf($(this).attr('optionalclass')) !== -1) && ($(this).attr('optionalclass') !== " ")) {
                $(this).addClass('multi-active-mrv');
                $('.variant-body-options-mrv .class-multi-button-mrv[optionalclass=" "]').removeClass('multi-active-mrv');
            } else {
                $('body').removeClass($(this).attr('optionalclass'));
            }
        });
    }

    function replaceBodyClasses(head, bodyClasses) {
        var headWithCommas = head.replace(/(\r\n|\n|\r)/gm, ","),
            linesArray = headWithCommas.split(','),
            replaced = false,
            originalHead = head,
            replacedHead = head;

        bodyClasses = (bodyClasses == " ") ? "" : bodyClasses;

        if (head.indexOf('[optional-body-classes]') === -1) {
            return head;
        }

        linesArray.forEach(function(line) {

            if (line.indexOf('[optional-body-classes]') !== -1) {

                if (bodyClasses != "") {

                    if (line.indexOf('class="') !== -1) {
                        replacedHead = String(head).replace('[optional-body-classes]', bodyClasses);
                        replaced = true;
                    } else {
                        replacedHead = String(head).replace('[optional-body-classes]', 'class="' + bodyClasses + '"');
                        replaced = true;
                    }
                } else {
                    replacedHead = String(head).replace(' [optional-body-classes]', '');
                    replacedHead = String(replacedHead).replace('[optional-body-classes]', '');
                    replaced = true;
                }
            }
        });
        if (replaced) {
            return replacedHead;
        }
    }

    function appendFontOptionToHead(head, font) {
        console.log('Font: ' + font);
        var modifiedHead = head,
            fontString, fontCss = "";
        if ((typeof font !== 'undefined') && (font.length > 0)) {
            if ($('.variant-font-set-mrv[variant-font-set-name-mrv="' + font + '"]').attr('variant-font-css-mrv') !== "variant-original-mrv") {
                fontCss = $('.variant-font-set-mrv[variant-font-set-name-mrv="' + font + '"]').attr('variant-font-css-mrv');
                fontString = "&#13;&#10;        &lt;link href=\"" + fontCss + "\" rel=\"stylesheet\" type=\"text/css\"&gt;&#13;&#10;";
                fontString += "        &lt;link href=\"css/font-" + convertToSlug(font) + ".css\" rel=\"stylesheet\" type=\"text/css\"&gt;&#13;&#10;    &lt;/head&gt;\n";
                console.log('fontString: ' + fontString);
                modifiedHead = modifiedHead.replace(/\t\&lt;\/head\&gt;/g, fontString);
                modifiedHead = modifiedHead.replace(/[\s]*\&lt;\/head\&gt;/g, fontString);
            }
        }
        return modifiedHead;
    }

    function initParallax() {
        if (window.mr_parallax != undefined) {
            setTimeout(window.mr_parallax.profileParallaxElements, 100);
            if (window.mr_parallax.callback != undefined) {
                $('.variant-page-mrv .parallax').each(function() {
                    window.mr_parallax.callback(this);
                });
            }
        }

    }

    function startup() {

        if ($.localStorage(templateNameSpace + '.state.last-state-id-mrv')) {
            $('.load-previous-page-mrv span').html('Load ' + $.localStorage(templateNameSpace + '.state.last-name-mrv'));
            $('.startup-button-mrv').removeClass('variant-hidden-mrv');
        } else if ($.localStorage(templateNameSpace + '.state.master-html-mrv')) {
            $('.load-previous-page-mrv span').removeClass('variant-hidden-mrv');
            $('.startup-button-mrv').removeClass('variant-hidden-mrv');
        } else {
            $('.start-new-page-mrv').removeClass('variant-hidden-mrv')
        }

        if (isSafari) {
            $('.all-html-button-mrv, .export-all-button-mrv, .single-html-button-mrv').remove()
        }

    }

    function checkForDemoLoad() {
        var demo = getURLParameter("demo");

        if (demo !== null) {
            console.log('Trying to load demo: ' + demo);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '../demos/' + demo + '.variant', true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                var file = [xhr.response];
                // importstate( file is blob of .variant, true is load immediately)
                importState(file, true);
            }
            xhr.onerror = function(e) {
                variantAlert('Could not load specified demo file.');
            }
            xhr.send();

        }

    }

    function filterIcons(filter) {
        $('.edit-icons-container-mrv').addClass('variant-filtered-mrv');
        $('.edit-icon-modal-mrv ul.variant-icon-sets-mrv div.choosable-icon-mrv').addClass('variant-hidden-mrv');
        $('.edit-icon-modal-mrv ul.variant-icon-sets-mrv div.choosable-icon-mrv span.icon-filter-title-mrv').remove();
        $('.edit-icon-modal-mrv ul.variant-icon-sets-mrv div.choosable-icon-mrv[icon-filter-mrv*="' + filter + '"]').each(function() {
            choosableIcon = $(this);
            choosableIcon.append('<span class="icon-filter-title-mrv">' + choosableIcon.attr('icon-filter-mrv').replace(filter, '<strong>' + filter + '</strong>') + '</span>');
            choosableIcon.removeClass('variant-hidden-mrv');
        });

        updateIconCounts();
    }

    function clearIconsFilter() {
        $('.edit-icons-container-mrv').removeClass('variant-filtered-mrv');
        $('.edit-icon-modal-mrv .variant-icon-sets-mrv li div.choosable-icon-mrv.variant-hidden-mrv').removeClass('variant-hidden-mrv');
        $('.edit-icon-filter-mrv').val("");
        $('.edit-icon-modal-mrv .edit-icon-clear-filter-mrv').addClass('variant-hidden-mrv');
        $('.edit-icon-modal-mrv ul.variant-icon-sets-mrv div.choosable-icon-mrv span.icon-filter-title-mrv').remove();
        updateIconCounts();
    }

    function updateIconCounts() {

        var setCount, pageCount, noneFound = true;

        $('.variant-none-found-mrv').remove();
        $('.edit-icon-modal-mrv ul.variant-icon-sets-mrv li.icon-pack-list-mrv').each(function(index, set) {
            setCount = $(this).find('div.choosable-icon-mrv:not(.variant-hidden-mrv)').length;
            if (setCount == 0) {
                $(this).addClass('variant-hidden-mrv').prev().addClass('variant-hidden-mrv');
            } else {
                if (setCount > 70) {
                    $('.edit-icons-container-mrv').addClass('variant-scroll-shadow-mrv');
                } else {
                    $('.edit-icons-container-mrv').removeClass('variant-scroll-shadow-mrv');
                }
                $(this).removeClass('variant-hidden-mrv').prev().removeClass('variant-hidden-mrv');
                noneFound = false;
            }

            $('.edit-icon-modal-mrv .variant-icon-sets-mrv li span.icon-pack-count-mrv').eq(index).text(setCount + ' icon' + (setCount > 1 ? "s" : "") + ' ' + (($('.edit-icon-filter-mrv').val() !== "") ? 'found' : 'in this pack') + ' ');
        });
        if (noneFound) {
            $('.edit-icons-container-mrv').append('<span class="variant-none-found-mrv">None Found</span>');
            $('.edit-icons-container-mrv').removeClass('variant-scroll-shadow-mrv');
        }
    }

    function addIconPacksToHead(head, content, foot) {
        var alteredHead = head,
            testTextArea, testDiv;
        iconPacks.forEach(function(pack, index) {
            testTextArea = $('<textarea>').append(content).append(foot),
                testDiv = $('<div>').html(testTextArea.text());

            alteredHead = alteredHead.replace('\n        ' + pack.headString.replace(/&quot;/g, '"') + '\n', '\n');
            alteredHead = alteredHead.replace(pack.headString.replace(/&quot;/g, '"') + '\n', '');

            if ($(testDiv).find('i[class*="' + pack.iconClass + '"], i[class*="' + pack.iconPrefix + '"]').length) {
                alteredHead = alteredHead.replace('\n        &lt;link ', '\n        ' + pack.headString + '\n        &lt;link ');
            }
        });
        return alteredHead;
    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    /*function makeReadable(content){
    	return content;
    	var readableHTML = content, hhh, bbb, fff, xxx, lb = '\r\n',
    	    htags = ["<html","</html>","</head>","<title","</title>","<meta","<link","<style","</style>","</body>"], 
    		btags = ["</div>","</span>","</form>","</fieldset>","<br>","<br />","<hr","<pre","</pre>","<blockquote","</blockquote>","<ul","</ul>","<ol","</ol>","<li","<dl","</dl>","<dt","</dt>","<dd","</dd>","<\!--","<table","</table>","<caption","</caption>","<th","</th>","<tr","</tr>","<td","</td>","<script","</script>","<noscript","</noscript>"],
    		ftags = ["<label","</label>","<legend","</legend>","<object","</object>","<embed","</embed>","<select","</select>","<option","<option","<input","<textarea","</textarea>"],
    	    xtags = ["<body","<head","<div","<span","<p","<form","<fieldset","<section"];

    	for (i=0; i<htags.length; ++i) {
    	 	hhh = htags[i];
    		readableHTML = readableHTML.replace(new RegExp(hhh,'gi'),lb+hhh);
    	}

    	for (i=0; i<btags.length; ++i) {
    		bbb = btags[i];
    		readableHTML = readableHTML.replace(new RegExp(bbb,'gi'),lb+bbb);
    	}

    	for (i=0; i<ftags.length; ++i) {
    	    fff = ftags[i];
    	    readableHTML = readableHTML.replace(new RegExp(fff,'gi'),lb+fff);
    	}

    	for (i=0; i<xtags.length; ++i) {
    		xxx = xtags[i];
    		readableHTML = readableHTML.replace(new RegExp(xxx,'gi'),lb+lb+xxx);
    	}
    	return content;
    }*/


    function getHTML(who, deep) {
        if (!who || !who.tagName) return '';
        var txt, ax, el = document.createElement("div");
        el.appendChild(who.cloneNode(false));
        txt = el.innerHTML;
        if (deep) {
            ax = txt.indexOf('>') + 1;
            txt = txt.substring(0, ax) + who.innerHTML + txt.substring(ax);
        }
        el = null;
        return txt;
    }

    // Handle enter button for [contenteditable]s
    // Thanks to: http://wadmiraal.net/lore/2012/06/14/contenteditable-hacks-returning-like-a-pro/
    function handleReturnKey(e) {
        if (window.getSelection) {
            e.stopPropagation();

            var selection = window.getSelection(),
                range = selection.getRangeAt(0),
                br = document.createElement('br');

            range.deleteContents();
            range.insertNode(br);
            range.setStartAfter(br);
            range.setEndAfter(br);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return false;
        }
        return true;
    }

    $.fn.focusEnd = function() {
        $(this).focus();
        var tmp = $('<span />').appendTo($(this)),
            node = tmp.get(0),
            range = null,
            sel = null;

        if (document.selection) {
            range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        } else if (window.getSelection) {
            range = document.createRange();
            range.selectNode(node);
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        tmp.remove();
        return this;
    }

} // END OF VARIANT OBJECT
window.mr_variant = new Variant();




function findStrings() {
    var output = '';
    var record = 0;
    var input = String(Variant);
    for (var i = 0, len = input.length; i < len; i++) {

        if (input[i] == '\'') {
            output += input[i];
            if (record == 0) {
                record = 1;
            } else {
                output += ',';
                record = 0;
            }
        } else {
            if (record == 1) {
                output += input[i];
            }
        }

    }
    var allStrings = output.split(',');
    allStringsSorted = allStrings.sort();
}

var removeDuplicatesInPlace = function(arr) {
    var i, j, cur, found;
    for (i = arr.length - 1; i >= 0; i--) {
        cur = arr[i];
        found = false;
        for (j = i - 1; !found && j >= 0; j--) {
            if (cur === arr[j]) {
                if (i !== j) {
                    arr.splice(i, 1);
                }
                found = true;
            }
        }
    }
    return arr;
};