#!/usr/bin/env ruby
require 'fileutils'

htmlFile = "app-icon.html"
outputFilePrefix = "app-icon-"

biggestSize = 1024
sizes = [
  57,
  72,
  76,
  114,
  120,
  144,
  152,
  180,
  192,
  196,
  512
]

biggestGeneratedFile = "#{outputFilePrefix}#{biggestSize}"
command = "webkit2png -C --clipwidth=#{biggestSize} --clipheight=#{biggestSize} -o #{biggestGeneratedFile} #{htmlFile}"
puts command
result = system(command)


sizes.each do |size|
  command = "convert #{biggestGeneratedFile}-clipped.png -resize #{size}x#{size} #{outputFilePrefix}#{size}.png"
  puts command
  result = system(command)
  if result != 0
  else
    puts "An error occured"
  end
end

FileUtils.rm("#{biggestGeneratedFile}-clipped.png")
