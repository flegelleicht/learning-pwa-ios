require 'bcrypt'
require 'securerandom'

class User < Sequel::Model
  def before_create
    self.created = Time.now
    self.modified = self.created
  end
  
  def before_update
    self.modified = Time.now
  end
  
  def pass=(p)
    s = BCrypt::Engine.generate_salt
    h = BCrypt::Engine.hash_secret(p, s)
    self.salt = s
    super(h)
  end
  
  def generate_token!
    self.tokn = SecureRandom.urlsafe_base64(64)
    self.save
  end
  
  def authenticate?(password)
    self.pass == BCrypt::Engine.hash_secret(password, self.salt)
  end
    
end
