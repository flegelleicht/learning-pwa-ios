Sequel.migration do
  up do
    create_table(:updates) do
      primary_key :id
      foreign_key :user_id, :users
      DateTime :at, null: false
      String :upd, null: false
    end
  end
  
  down do
    drop_table(:users)
  end
end
