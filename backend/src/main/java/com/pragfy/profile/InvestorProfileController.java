package com.pragfy.profile;

import com.pragfy.profile.dto.ProfileRequest;
import com.pragfy.profile.dto.ProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class InvestorProfileController {

    private final InvestorProfileService profileService;

    @GetMapping
    public ProfileResponse findByUser(@RequestParam Long userId) {
        return profileService.findByUser(userId);
    }

    @PostMapping
    public ProfileResponse save(@Valid @RequestBody ProfileRequest request) {
        return profileService.save(request);
    }
}
