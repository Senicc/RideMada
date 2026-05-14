@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val phone: String,
    val photo: String?,
    val role: String,
    val rating: Float
)