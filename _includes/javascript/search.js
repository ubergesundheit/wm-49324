var _resetSearch = function () {
  this._searchInputNode.value = "";
  // manually call _onSearchInput because programatically
  // setting the value does not trigger the event
  _onSearchInput.apply(this);

  this._resultList = [];
};

var _onSearchInput = function (evt) {
  this._currentSearchString = this._getSearchString();
  // check if input is not empty
  if (this._currentSearchString !== "") {
    showNodeById("reset_search");
  } else {
    hideNodeById("reset_search");
  }

  // apply style to geojson..
  this._staendeLayer.setStyle(this._staendeStyleFilterFunction.bind(this));
  this._handleResultList();
};

var _bumpResult = function (dir) {
  if (this._resultList && this._resultList.length > 0) {
    var maxIndex = this._resultList.length - 1;
    if (dir < 0) {
      if (this._currentSelectedResultIndex !== 0) { //previous..
        this._currentSelectedResultIndex -= 1;
      } else {
        this._currentSelectedResultIndex = maxIndex;
      }
    } else {
      if (this._currentSelectedResultIndex !== maxIndex) { //next..
        this._currentSelectedResultIndex += 1;
      } else {
        this._currentSelectedResultIndex = 0;
      }
    }
    this._setSearchResultDisplay(this._resultList[this._currentSelectedResultIndex]);
  }
};

var _nextResult = function () {
  _bumpResult.call(this, 1);
};

var _prevResult = function () {
  _bumpResult.call(this, -1);
};

L.Util.extend(window.Weihnachtsmarkt, {
  _currentSearchString: "",
  _tempResultList: [],
  _currentSelectedResultIndex: 0,
  _getSearchString: function () {
    var str = "";
    if (this._searchInputNode && this._searchInputNode.value) {
      str = L.Util.trim(this._searchInputNode.value).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    return str;
  },
  _resetSearchResultDisplay: function () {
    showNodeById("initialSearchResultView");
    this._resultNodeHint.textContent = "{{ site.strings.initialSearchResultView }}";
    this._currentResultHeadline.textContent = "";
    this._currentResultDescription.textContent = "";
    L.DomUtil.get("right").classList.add("disabled");
    L.DomUtil.get("left").classList.add("disabled");
    this._highlightResult();
  },
  _setSearchResultDisplay: function (searchResultObj) {
    hideNodeById("initialSearchResultView");
    this._currentResultHeadline.textContent = "-";
    this._currentResultDescription.textContent = "-";
    const resultProps = searchResultObj.properties;
    if (resultProps) {
      let headline = resultProps.stand;
      if (resultProps.betreiber) {
        headline = headline + " - " + resultProps.betreiber;
      }
      this._currentResultHeadline.textContent = headline;
      let description = [];

      this._searchableProperties.forEach(function (prop) {
        if (prop === "stand" || prop === "betreiber") {
          return;
        }
        if (resultProps[prop]) {
          if (Array.isArray(resultProps[prop])) {
            resultProps[prop].forEach(function (v) {
              description.push(v);
            });
          } else {
            description.push(resultProps[prop]);
          }
        }
      });
      if (resultProps.length !== 0) {
        this._currentResultDescription.textContent = description.join(", ");
      }
    }
    if (this._resultList && this._resultList.length > 1) {
      L.DomUtil.get("right").classList.remove("disabled");
      L.DomUtil.get("left").classList.remove("disabled");
    }
    this._highlightResult(searchResultObj);
  },
  _handleResultList: function () {
    this._resultList = undefined;
    if (L.Util.isArray(this._tempResultList) && this._tempResultList.length > 0) {
      this._resultList = this._tempResultList.slice(0);
    } else if (this._currentSearchString !== "") {
      this._resultList = [];
    }

    this._resetSearchResultDisplay();
    if (this._resultList) {
      if (this._resultList.length === 0) {
        this._resultNodeHint.textContent = L.Util.template("{{ site.strings.noResults }}", { str: this._currentSearchString });
      } else {
        hideNodeById("initialSearchResultView");
        // check if the resultIndex is still valid
        if (this._currentSelectedResultIndex > this._resultList.length - 1) {
          this._currentSelectedResultIndex = this._resultList.length - 1;
        }
        this._setSearchResultDisplay(this._resultList[this._currentSelectedResultIndex]);
      }
    }
    this._tempResultList = [];
  },
  _addLayerToResultList: function (layer) {
    if (!this._tempResultList) {
      this._tempResultList = [];
    }

    this._tempResultList.push(layer);
  },
  _initSearch: function () {
    // searchable attributes..
    this._searchableProperties = {{ site.searchableProperties | jsonify }};

    // init search input node
    this._searchInputNode = L.DomUtil.get("search_input");
    // reset Button..
    attachClick("reset_search", _resetSearch.bind(this));

    // attach event on input
    this._searchInputNode.addEventListener("input", _onSearchInput.bind(this));

    // detailview
    attachClick("left", _prevResult.bind(this));
    attachClick("right", _nextResult.bind(this));
    this._currentResultNode = L.DomUtil.get("searchResult");
    this._currentResultHeadline = L.DomUtil.get("searchResultHeadline");
    this._currentResultDescription = L.DomUtil.get("searchResultDescription");
    this._resultNodeHint = L.DomUtil.get("initialSearchResultView");
  }
});
