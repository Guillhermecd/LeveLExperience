package br.com.oaksd.kanban.entity;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import org.hibernate.type.descriptor.ValueBinder;
import org.hibernate.type.descriptor.ValueExtractor;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.descriptor.jdbc.BasicBinder;
import org.hibernate.type.descriptor.jdbc.BasicExtractor;
import org.hibernate.type.descriptor.jdbc.JdbcType;

// Postgres reports CITEXT columns as Types#OTHER, not VARCHAR — the default
// OTHER handling tries to unwrap the value as bytes, which breaks String
// fields. This binds/extracts as plain text while still reporting OTHER so
// schema validation (ddl-auto: validate) matches the real column type.
public class CitextJdbcType implements JdbcType {

  public static final CitextJdbcType INSTANCE = new CitextJdbcType();

  @Override
  public int getJdbcTypeCode() {
    return Types.OTHER;
  }

  @Override
  public <X> ValueBinder<X> getBinder(JavaType<X> javaType) {
    return new BasicBinder<>(javaType, this) {
      @Override
      protected void doBind(PreparedStatement st, X value, int index, WrapperOptions options) throws SQLException {
        st.setString(index, javaType.unwrap(value, String.class, options));
      }

      @Override
      protected void doBind(CallableStatement st, X value, String name, WrapperOptions options) throws SQLException {
        st.setString(name, javaType.unwrap(value, String.class, options));
      }
    };
  }

  @Override
  public <X> ValueExtractor<X> getExtractor(JavaType<X> javaType) {
    return new BasicExtractor<>(javaType, this) {
      @Override
      protected X doExtract(ResultSet rs, int paramIndex, WrapperOptions options) throws SQLException {
        return javaType.wrap(rs.getString(paramIndex), options);
      }

      @Override
      protected X doExtract(CallableStatement statement, int index, WrapperOptions options) throws SQLException {
        return javaType.wrap(statement.getString(index), options);
      }

      @Override
      protected X doExtract(CallableStatement statement, String name, WrapperOptions options) throws SQLException {
        return javaType.wrap(statement.getString(name), options);
      }
    };
  }
}
