// https://github.com/OscarGodson/JSONP
(function(e,t){var n=function(t,n,r,i){t=t||"";n=n||{};r=r||"";i=i||function(){};var s=function(e){var t=[];for(var n in e){if(e.hasOwnProperty(n)){t.push(n)}}return t};if(typeof n=="object"){var o="";var u=s(n);for(var a=0;a<u.length;a++){o+=encodeURIComponent(u[a])+"="+encodeURIComponent(n[u[a]]);if(a!=u.length-1){o+="&"}}t+="?"+o}else if(typeof n=="function"){r=n;i=r}if(typeof r=="function"){i=r;r="callback"}if(!Date.now){Date.now=function(){return(new Date).getTime()}}var f=Date.now();var l="jsonp"+Math.round(f+Math.random()*1000001);e[l]=function(t){i(t);delete e[l]};if(t.indexOf("?")===-1){t=t+"?"}else{t=t+"&"}var c=document.createElement("script");c.setAttribute("src",t+r+"="+l);document.getElementsByTagName("head")[0].appendChild(c)};e.JSONP=n})(window)

function updateStats() {
  JSONP('http://earth.georeferencer.com/collection/95215265/stats.json',
    function(data) {
      var reviewedCount = document.getElementById('progress-reviewed-count');
      var editedCount = document.getElementById('progress-edited-count');
      var totalCount = document.getElementById('progress-total-count');

      var reviewed = document.getElementById('progress-reviewed');
      var edited = document.getElementById('progress-edited');
      var rest = document.getElementById('progress-rest');

      var totalCount_ = data.map.objects;
      var editedCount_ = data.map.products.georeference.touched +
                         data.map.products.georeference.finished +
                         data.map.products.georeference.impossible;
      var reviewedCount_ = data.map.products.georeference['finished-reviewed'] +
                           data.map.products.georeference['impossible-reviewed'];

      totalCount.innerHTML = totalCount_;
      editedCount.innerHTML = editedCount_;
      reviewedCount.innerHTML = reviewedCount_;

      reviewed.style.width = (100 * reviewedCount_ / totalCount_) + '%';
      edited.style.width = (100 * (editedCount_ - reviewedCount_) / totalCount_) + '%';
      rest.style.width = (100 * (totalCount_ - editedCount_) / totalCount_) + '%';

      if (reviewedCount_ == 0) {
        reviewed.style.display = 'none';
        reviewedCount.style.display = 'none';
      }
      if (editedCount_ == 0) {
        edited.style.display = 'none';
        editedCount.style.display = 'none';
      }
    });
}
updateStats();


var cardsPerPage = 5;

var rawCollection = null;
var collection = null;

function createSingleItem(data) {
  var html = '<div class="card">';
  html += '<img src="' + data['thumbnail_url'] + '/square/150,150/0/native.jpg">';
  html += '<div class="card-text"><h3>' + data['title'] + '</h3><p>' + data['id'] + '</p>';
  html += '<a href="' + data['georeference_url'] + '" target="_blank" class="btn-small-gray-dark">Georeference</a>';
  if (data['visualize_url']) html += '<a href="' + data['visualize_url'] + '" target="_blank" class="btn-small-gray-light">Vizualize</a>';
  html += '</div></div>';
  return html;
}

var cards = document.getElementById('cards');
var currentPageEl = null;
function showPage(num, el) {
  if (currentPageEl) currentPageEl.className = '';

  var html = '';
  for (var i = 0; i < cardsPerPage; i++) {
    var id = num * cardsPerPage + i;
    if (collection[id]) html += createSingleItem(collection[id]);
  }
  cards.innerHTML = html;

  currentPageEl = el;
  if (currentPageEl) currentPageEl.className = 'current';
};

function createPaginator() {
  var paginator = document.getElementById('paginator');
  var numPages = Math.ceil(collection.length / cardsPerPage);
  var html = '';
  for (var i = 1; i < numPages; i++) {
    html += '<a href="#" onclick="showPage(' + i + ', this);return false;">' + i + '</a>';
    if (i < numPages) html += ' | ';
  }
  //html += '<a class="icon" href="#" onclick="showPage(null);">&gt;</a>';
  paginator.innerHTML = html;
  showPage(1);
};

var filter = document.getElementById('filter-notreferenced');
var filterCollection = function() {
  var onlyNonGeoreferenced = filter.checked;
  if (onlyNonGeoreferenced) {
    collection = [];
    rawCollection.forEach(function(el) {
      if (el.visualize_url == null) collection.push(el);
    });
  } else {
    collection = rawCollection;
  }
  createPaginator();
}


JSONP('http://earth.georeferencer.com/collection/95215265/objects/json', function(data) {
  rawCollection = data;
  // sort by 'id'
  rawCollection.sort(function(a, b) {
    return parseInt(a['id'] || '', 10) - parseInt(b['id'] || '', 10);
  });
  filterCollection();
});

filter.onchange = function() {
  filterCollection();
};




// top contributors
var topContribUrl = 'http://cynefin.georeferencer.com/repository/49189082/top-contributors.json?limit=5';
google.load('visualization', '1', {'packages': ['table'], 'callback': function() {
  var tableContainer = document.getElementById('top-contributors');
  var table = new google.visualization.Table(tableContainer);
  var query = new google.visualization.Query(topContribUrl, {});
  query.send(function(response) {
    if (response.isError()) {
      throw Error(response.getMessage() + ' ' + response.getDetailedMessage());
    } else {
      var dataTable = response.getDataTable();
      table.draw(dataTable, {showRowNumber: true});
    }
  });
}});
