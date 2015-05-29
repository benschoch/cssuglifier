var div = jQuery('div .mixedClass #hello');

var justAfileName = '/path/actually_no_class.json';

var div2 = jQuery('.oviousClass');

var div3 = $('#idOnlyPleaseIgnore');

var attrSelector = $('#someId input[type=text].subClass');

var justAtag = $('section');
var bemSelector = $('.b__el');

var regexTest = new RegExp('(\.testString)', 'g');

div.append('<span class="classAttr"></span>');
var span = div.find(".find");
if (span.hasClass("hasClassCall")) {
  span.addClass("addClassCall");
  div.toggleClass("toggleClassCall toggleClassMultiCall");
}
if (span.is(".isClass")) {

}