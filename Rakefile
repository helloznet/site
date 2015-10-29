desc "Convert Pictures"
task :pics do
  require 'rubygems'
  require 'rmagick'
  puts "## converting images"
  path_raw_imgs = "/var/www/html/znet/raw_images" 
  path_processed_imgs = "/var/www/html/znet/images"
  
  Dir.chdir(path_raw_imgs)
  Dir.glob("*.jpg") do |filename|

    img = Magick::Image.read(filename).first
	
	img.strip!
	
    make_image  :image_object=>img, 
                :folder=>'large', 
                :max_x=>1920, 
                :max_y=>1080, 
                :quality=>40
    make_image  :image_object=>img, 
                :folder=>'medium', 
                :max_x=>960, 
                :max_y=>450, 
                :quality=>50
    make_image  :image_object=>img, 
                :folder=>'small', 
                :max_x=>480, 
                :max_y=>275, 
                :quality=>50
    make_image  :image_object=>img, 
                :folder=>'thumbnail', 
                :max_x=>300, 
                :max_y=>200, 
                :quality=>50
			  
    make_landscape_image    :image_object=>img, 
                            :folder=>'portrait', 
                            :max_x=>400, 
                            :max_y=>700, 
                            :quality=>50
						  
  end
end


def make_image(image)
  require "rubygems"
  require "rmagick"
  path_to_processed_img_folder = "/var/www/html/znet/images"

  path_to_processed_img = "#{path_to_processed_img_folder}/#{image[:folder]}/#{image[:image_object].filename}" 
  unless File.exist?(path_to_processed_img)
    puts image[:image_object].filename + ": #{image[:folder]}"

    processed_img = image[:image_object].resize_to_fill(image[:max_x], image[:max_y], Magick::NorthGravity)
    processed_img.write(path_to_processed_img){ 
      self.quality = image[:quality]
      self.interlace = Magick::PlaneInterlace
    }
  end
end


def make_landscape_image(image)
  require "rubygems"
  require "rmagick"
  path_to_processed_img_folder = "/var/www/html/znet/images"

  path_to_processed_img = "#{path_to_processed_img_folder}/#{image[:folder]}/#{image[:image_object].filename}" 
  unless File.exist?(path_to_processed_img)
    puts image[:image_object].filename + ": #{image[:folder]}"

    processed_img = image[:image_object].resize_to_fill(image[:max_x], image[:max_y], Magick::NorthGravity)
    processed_img.write(path_to_processed_img){ 
      self.quality = image[:quality]
      self.interlace = Magick::PlaneInterlace
    }
  end
end