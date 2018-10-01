class Update < Sequel::Model
  def before_create
    self.at = Time.now
  end
end
