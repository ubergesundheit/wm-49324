#!/usr/bin/env ruby
$VERBOSE=true

require "json"
require "yaml"

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# load source geojson
data = JSON.parse(File.read("melle-weihnachtsmarkt.geojson"))

# from http://stackoverflow.com/questions/1268289/how-to-get-rid-of-non-ascii-characters-in-ruby
encoding_options = {
  :invalid           => :replace,  # Replace invalid byte sequences
  :undef             => :replace,  # Replace anything not defined in ASCII
  :replace           => '',        # Use a blank for those replacements
  :universal_newline => true       # Always break lines with \n
}

# each feature to yaml file..
data["features"].each do |feature|
  yml_stand = feature
  yml_stand["geometry"] = feature["geometry"].to_json
  yml_stand["properties"]["angebot"] = nil
  yml_stand["properties"]["betreiber"] = nil
  yml_stand["properties"]["telefon"] = nil
  yml_stand["properties"]["email"] = nil
  yml_stand["properties"]["label"] = nil

  File.open("_data/staende/#{yml_stand["properties"]["stand"]}.yml","w") do |f|
    f.write(yml_stand.to_yaml)
  end
end
