Sequel.migration do
  up do
    create_table(:users) do
      primary_key :id
      DateTime :created
      DateTime :modified
  
      String :login, unique: true
      String :mail
      String :pass, null: false
      String :salt, null: false
    end    
  end
  
  down do
    drop_table(:users)
  end
end
