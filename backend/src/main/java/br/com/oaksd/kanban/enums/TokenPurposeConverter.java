package br.com.oaksd.kanban.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TokenPurposeConverter implements AttributeConverter<TokenPurpose, String> {

  @Override
  public String convertToDatabaseColumn(TokenPurpose attribute) {
    return attribute == null ? null : attribute.value();
  }

  @Override
  public TokenPurpose convertToEntityAttribute(String dbData) {
    if (dbData == null) {
      return null;
    }
    for (TokenPurpose purpose : TokenPurpose.values()) {
      if (purpose.value().equals(dbData)) {
        return purpose;
      }
    }
    throw new IllegalArgumentException("Unknown token purpose: " + dbData);
  }
}
