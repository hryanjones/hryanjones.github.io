#! /usr/bin/ruby

require 'pp'
require 'csv'
require 'rubygems'
require 'json'
require 'set'

def cleanup_tags(line)
  Set.new(line[2..6].select { |d| d }) # remove nils and any repetition
end

data = CSV::StringReader.new(File.read('MyHindiData.csv')).to_a
data.shift # first line is just headers

output = {
  :nodes => [],
  :links => []
}

#data = data[3..11]

data.each do |line|
  output[:nodes].push({
    :name => line[0],
    :pronunciation => line[1],
    :group => 1
  })
end

# calculate link strengths
data.each_with_index do |line, i|
  these_tags = cleanup_tags(line)
  data[(i+1)..data.length].each_with_index do |targ_line, j|
    those_tags = cleanup_tags(targ_line)
    weight = these_tags.intersection(those_tags).length
    if weight != 0
      weight = weight/((those_tags.length+these_tags.length)/2.0)
      output[:links].push({
        :source => i,
        #:source_tags => these_tags.to_a,
        #:target_tags => those_tags.to_a,
        :target => j+i+1,
        :value => weight
      })
    end
  end
end

#puts JSON.pretty_generate(output) #.to_json
#=begin
File.open("./my_hindi_alphabet.json","w") do |f|
  f.write(output.to_json)
end
#=end
