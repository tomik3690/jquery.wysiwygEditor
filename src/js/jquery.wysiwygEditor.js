$.fn.wysiwygEditor = function() {

  'use strict'

  var textarea = this;

  var randomID = 'wysiwygEditor-' + Math.floor(Math.random() * 1000000);
  var actions = require('./actions')
  var markup = require('./markup');
  var iframeLoaded = require('./iframeLoaded');
  var iframeSettings = require('./iframeSettings');
  var getAction = require('./getAction');
  var backlightActiveTools = require('./backlightActiveTools');

  // Hide original textarea
  textarea.css('display', 'none');
  textarea.addClass(randomID);

  // Create new wysiwygEditor
  textarea.before(markup(randomID, actions));

  var iframe = $('#' + randomID).find('iframe');

  iframeLoaded(iframe, function() {

    var editArea = iframe[0].contentDocument;

    // Set iframe width
    iframeSettings.setWidth(iframe);

    // Set iframe body to editable
    iframeSettings.setAttributes(editArea);

    // Iframe body styles
    iframeSettings.setStylesheet(editArea);
    iframeSettings.setCss(editArea);

    // Copy data from textarea to iframe
    $(editArea.body).html(textarea.val());

    // Bind click events for toolbar
    $.each(actions, function(i) {
      $('#' + randomID).find('.wysiwygEditor-' + actions[i].title).bind('click', function(e) {
        e.preventDefault();
        editArea.body.focus();
        if(typeof(actions[i].value) != 'undefined')
          editArea.execCommand(getAction(actions[i]), false, prompt(actions[i].desc));
        else
          editArea.execCommand(getAction(actions[i]), false, null);

        $(this).toggleClass('action-active');

        backlightActiveTools(randomID, $(editArea.getSelection().anchorNode).parents(), actions);
      });
    });

    // Trigger contentChanged
    $.each(['click', 'keyup'], function() {
      $(editArea.body).bind(this, function(e) {
        if($(this).html() != textarea.val())
          $(this).trigger('contentChanged');

        // Update footer element indicator
        var footerElementIndicator = '';
        var elements = $(editArea.getSelection().anchorNode).parents();
        for(var i = elements.length - 1; i >= 0; i--) {
          footerElementIndicator += elements[i].nodeName;
          if(i != 0)
            footerElementIndicator+= ' &raquo; ';
        }
        $('#' + randomID).find('.wysiwygEditor-footer').html(footerElementIndicator);
        // console.log(footerElementIndicator.split(' &raquo; '));

        backlightActiveTools(randomID, elements, actions);
      });

    });

    // Textarea synchronization
    $(editArea.body).on('contentChanged', function() {
      textarea.val($(this).html());
    });
  });

  return this;
}
