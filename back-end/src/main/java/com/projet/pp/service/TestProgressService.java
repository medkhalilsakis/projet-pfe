package com.projet.pp.service;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TestProgressService {
    @Autowired
    TestTypeSelectionRepository typeRepo;
    @Autowired
    TestLevelProgressRepository levelRepo;
    @Autowired ProjectRepository projectRepo;
    @Autowired
    UserRepository userRepo;

    public List<String> getTypes(Long pid, Long uid) {
        return typeRepo.findByProjectIdAndTesterId(pid,uid)
                .stream().map(TestTypeSelection::getTestType).toList();
    }

    @Transactional
    public void saveTypes(Long pid, Long uid, List<String> types) {
        // supprime ancien
        typeRepo.deleteByProjectAndTester(pid,uid);
        Project p = projectRepo.findById(pid).orElseThrow();
        User u = userRepo.findById(uid).orElseThrow();
        types.forEach(t -> {
            var sel = new TestTypeSelection();
            sel.setProject(p); sel.setTester(u); sel.setTestType(t);
            typeRepo.save(sel);
        });
    }

    public Map<String,Boolean> getLevels(Long pid, Long uid) {
        return levelRepo.findByProjectIdAndTesterId(pid,uid)
                .stream().collect(Collectors.toMap(TestLevelProgress::getLevel, TestLevelProgress::isCompleted));
    }

    @Transactional
    public void updateLevel(Long pid, Long uid, String level, boolean done) {
        Project p = projectRepo.findById(pid).orElseThrow();
        User u = userRepo.findById(uid).orElseThrow();
        var list = levelRepo.findByProjectIdAndTesterId(pid,uid);
        Optional<TestLevelProgress> opt = list.stream()
                .filter(l -> l.getLevel().equals(level)).findFirst();
        TestLevelProgress tp = opt.orElseGet(() -> {
            var newp = new TestLevelProgress();
            newp.setProject(p); newp.setTester(u); newp.setLevel(level);
            return newp;
        });
        tp.setCompleted(done);
        tp.setCompletedAt(done? LocalDateTime.now(): null);
        levelRepo.save(tp);
    }
}

