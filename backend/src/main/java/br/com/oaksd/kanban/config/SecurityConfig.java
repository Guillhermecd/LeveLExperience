package br.com.oaksd.kanban.config;

import br.com.oaksd.kanban.security.JsonAuthenticationEntryPoint;
import br.com.oaksd.kanban.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http,
      @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource,
      JwtAuthenticationFilter jwtFilter, JsonAuthenticationEntryPoint authEntryPoint) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsSource))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // Without this, a missing/invalid token falls through to Spring
        // Security's default Http403ForbiddenEntryPoint — see
        // JsonAuthenticationEntryPoint for why that breaks token refresh.
        .exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            // Without this, an uncaught exception on an authenticated request
            // forwards internally to /error, which itself requires auth again
            // (the forward doesn't reliably carry the SecurityContext) — the
            // real 500 gets masked as an empty 403 (see XpService.settle's
            // NestedTransactionNotSupportedException incident).
            .requestMatchers("/error").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
