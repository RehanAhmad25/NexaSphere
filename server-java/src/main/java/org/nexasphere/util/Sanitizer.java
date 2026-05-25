package org.nexasphere.util;

import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

@Component
public class Sanitizer {

    public String clean(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim().replace("\u0000", "");
        return HtmlUtils.htmlEscape(trimmed);
    }
}
