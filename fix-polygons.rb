#!/usr/bin/env ruby
$VERBOSE=true

require "yaml"
require "json"

data_dir = "_data/staende"

# stolen from mapbox/geojson-rewind
def rewind_rings(rings, outer)
  return if rings.empty?

  rewind_ring(rings[0], outer)
  rings[1..-1].each do |ring|
    rewind_ring(ring, !outer)
  end
end

def rewind_ring(ring, dir)
  area = 0
  err = 0

  len = ring.length
  (0...len).each do |i|
    j = (i - 1) % len
    k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1])
    m = area + k
    err += (area.abs >= k.abs) ? area - m + k : k - m + area
    area = m
  end

  if (area + err >= 0) != dir
    ring.reverse!
  end
end

Dir.foreach(data_dir) do |filename|
  next if filename == '.' or filename == '..' or not filename.end_with? ".yml"

  path = "#{data_dir}/#{filename}"
  stand = YAML.load(File.read(path))

  geometry = JSON.parse(stand["geometry"])

  geometry["type"] = "Polygon"
  geometry["coordinates"] = geometry["coordinates"][0]
  rewind_rings(geometry["coordinates"], false)

  stand["geometry"] = geometry.to_json

    # puts(stand.to_yaml)
  File.open(path, "w") do |f|
    f.write(stand.to_yaml)
  end
end
