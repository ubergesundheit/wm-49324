L.extend(window.Weihnachtsmarkt, {
  _onFeatureClick: function (evt) {
    var layer = evt.target;
    if (window.NEXT_CLICK_ENABLES_EDIT === true) {
      this._enableEditingForLayer(layer);
      window.NEXT_CLICK_ENABLES_EDIT = false;
    } else if (!window.IN_EDIT_MODE) {
      if (layer.options._layertarget) {
        this._setSearchResultDisplay(layer.options._layertarget.toGeoJSON());
      } else {
        this._setSearchResultDisplay(layer.toGeoJSON());
      }
    }
  },
  _staendeStyleFilterFunction: function (layer) {
    var styleToApply = this._staendeStyles.normal;
    var searchString = this._currentSearchString;
    if (searchString !== "") {
      var layerProperties = layer.properties;
      var compareRegex = RegExp(searchString, 'i');
      if (this._searchableProperties.some(function (prop) {
        if (L.Util.isArray(layerProperties[prop])) {
          return layerProperties[prop].some(function (p) {
            return compareRegex.test(p);
          });
        } else {
          return compareRegex.test(layerProperties[prop]);
        }
      })) {
        styleToApply = this._staendeStyles.high;
        this._addLayerToResultList(layer);
      } else {
        styleToApply = this._staendeStyles.low;
      }
    }
    return styleToApply;
  },
  _highlightResult: function (result) {
    this._highlightLayer.clearLayers();
    if (result) {
      this._highlightLayer.addData(result);
    }
  },
  _widerThanTall(layer) {
    const p1 = this._map.latLngToLayerPoint(layer.getBounds().getNorthWest());
    const p2 = this._map.latLngToLayerPoint(layer.getBounds().getSouthEast());

    return p2.x - p1.x > p2.y - p1.y;
  },
  _initMap: function () {
    var map = L.map("map",{
      center: {{ site.map.center | jsonify }},
      zoom: {{ site.map.zoom }},
      attributionControl: false,
    });
    this._map = map;

    this._staendeStyles = {
      normal: {
        color: "{{ site.map.normalColor }}",
        weight: 0,
        opacity: 1,
        fillOpacity: 0.8
      },
      high: {
        color: "{{ site.map.highColor }}",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      low: {
        color: "{{ site.map.lowColor }}",
        weight: 0,
        opacity: 0.5,
        fillOpacity: 0.5
      },
      result: {
        color: "{{ site.map.resultColor }}",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }
    };

    L.tileLayer("{{ site.map.tileLayerUrl }}", {
      maxZoom: 22
    }).addTo(map);

    this._staendeLayer = L.geoJson(this._rawdata,{
      style: this._staendeStyleFilterFunction.bind(this),
      onEachFeature: function (feature, layer) {
        layer.on("click", this._onFeatureClick.bind(this));

        const innerDivContainer = L.DomUtil.create("div");

        const standNummerContainer = L.DomUtil.create("div", "standnummer", innerDivContainer);
        standNummerContainer.textContent = feature.properties.stand;

        const standTypContainer = L.DomUtil.create("div", "standtyp", innerDivContainer);
        standTypContainer.textContent = feature.properties.typ;

        if (this._widerThanTall(layer)) {
          L.DomUtil.addClass(innerDivContainer, "wider-than-tall");
        }

        const standmarker = L.marker(L.PolyUtil.centroid(layer._latlngs[0]), {icon: L.divIcon({className: 'standlabel', html: innerDivContainer}), _layertarget: layer});
        standmarker.on("click", this._onFeatureClick.bind(this));
        standmarker.addTo(map);
      }.bind(this)
    }).addTo(map);

    L.geoJson(this._rawExtinguishers, {
      pointToLayer: function(geoJsonPoint, latlng) {
        return L.marker(latlng, {icon: L.divIcon({className: 'feuerloescher', html: "F"})});
      }
    }).addTo(map);

    this._highlightLayer = L.geoJson({type:"FeatureCollection",features:[]}, {
      style: this._staendeStyles.result
    }).addTo(map);

    return map;
  }
});
