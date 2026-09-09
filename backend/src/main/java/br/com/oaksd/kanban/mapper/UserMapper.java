package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.UserResponse;
import br.com.oaksd.kanban.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  @Mapping(target = "emailVerified", expression = "java(user.getEmailVerifiedAt() != null)")
  UserResponse toResponse(User user);
}
