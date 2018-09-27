#!/usr/bin/env ruby
require 'fileutils'

htmlFile = "splash-screen.html"
outputFilePrefix = "apple_splash_"

sizes = [
  "640x1136",
  "750x1294",
  "1242x2148",
  "1125x2436",
  "1536x2048",
  "1668x2224",
  "2048x2732"
]

sizes.each do |size|
  w, h = size.split('x')
  puts "#{w} #{h}"
  
  command = "webkit2png -C --clipwidth=#{w} --clipheight=#{h} -o #{outputFilePrefix}#{w} #{htmlFile}"
  puts command

  result = system(command)
  if result != 0
    FileUtils.mv("#{outputFilePrefix}#{w}-clipped.png", "#{outputFilePrefix}#{w}.png")
  else
    puts "An error occured"
  end
end
