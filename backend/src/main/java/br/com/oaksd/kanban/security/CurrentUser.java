package br.com.oaksd.kanban.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Binds a controller method parameter (UUID) to the authenticated user's id,
// read from the JWT `sub` claim — never re-fetched from the DB per request.
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface CurrentUser {
}
