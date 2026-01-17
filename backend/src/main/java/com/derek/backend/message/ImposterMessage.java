package com.derek.backend.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImposterMessage {
    private String role;
    private String categoryHint;
}
