package com.pragfy.profile.dto;

import com.pragfy.profile.InvestorProfile;
import com.pragfy.profile.RiskProfile;
import java.time.LocalDateTime;

public record ProfileResponse(
        Long id,
        Long userId,
        RiskProfile riskProfile,
        String answers,
        LocalDateTime updatedAt
) {
    public static ProfileResponse from(InvestorProfile p) {
        return new ProfileResponse(
                p.getId(),
                p.getUser().getId(),
                p.getRiskProfile(),
                p.getAnswers(),
                p.getUpdatedAt()
        );
    }
}
